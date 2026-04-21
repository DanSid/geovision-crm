import React, { useRef } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Eye, Paperclip, Trash2, Upload } from 'react-feather';
import { connect } from 'react-redux';
import { addDocument, deleteDocument } from '../../../../redux/action/Crm';

const fmt = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const fmtDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const typeIcon = (type) => {
    if (!type) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('zip') || type.includes('compressed')) return '🗜️';
    return '📄';
};

const DocumentsTab = ({ entityType, entityId, documents, addDocument, deleteDocument }) => {
    const fileRef = useRef(null);

    const myDocs = documents
        .filter(d => d.entityType === entityType && String(d.entityId) === String(entityId))
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                addDocument({
                    entityType,
                    entityId,
                    name: file.name,
                    type: file.type || 'unknown',
                    size: file.size,
                    dataUrl: ev.target.result, // store base64 so we can view it
                });
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    // Open file in new tab using the stored base64 data URL
    const handleView = (doc) => {
        if (!doc.dataUrl) {
            alert('This document was uploaded before view support was added. Please re-upload the file to enable viewing.');
            return;
        }
        // For PDFs and images, open directly in a new tab
        const win = window.open('', '_blank');
        if (doc.type && (doc.type.includes('pdf') || doc.type.includes('image'))) {
            win.document.write(`
                <html>
                  <head><title>${doc.name}</title></head>
                  <body style="margin:0;background:#1a1a1a;">
                    <iframe src="${doc.dataUrl}" style="width:100vw;height:100vh;border:none;"></iframe>
                  </body>
                </html>
            `);
        } else {
            // For other types, trigger a download
            const a = win.document.createElement('a');
            a.href = doc.dataUrl;
            a.download = doc.name;
            win.document.body.appendChild(a);
            a.click();
            win.close();
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">{myDocs.length} document{myDocs.length !== 1 ? 's' : ''}</h6>
                <Button size="sm" variant="primary" onClick={() => fileRef.current?.click()}>
                    <Upload size={14} className="me-1" />Upload Document
                </Button>
                <input
                    type="file"
                    multiple
                    ref={fileRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>

            {myDocs.length === 0 ? (
                <div
                    className="text-center py-5 text-muted border-2 border-dashed rounded"
                    style={{ border: '2px dashed #dee2e6', cursor: 'pointer' }}
                    onClick={() => fileRef.current?.click()}
                >
                    <Paperclip size={32} className="mb-2 text-muted" />
                    <p className="mb-1">No documents uploaded yet.</p>
                    <p className="fs-7">Click here to upload files</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Uploaded</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myDocs.map(d => (
                                <tr key={d.id}>
                                    <td className="fw-medium fs-7">
                                        <span className="me-1">{typeIcon(d.type)}</span>
                                        {d.name}
                                    </td>
                                    <td className="fs-7 text-muted">{d.type || '—'}</td>
                                    <td className="fs-7">{fmt(d.size)}</td>
                                    <td className="fs-7">{fmtDate(d.uploadedAt)}</td>
                                    <td className="text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-1">
                                            <Button
                                                variant="soft-info"
                                                size="sm"
                                                className="btn-icon btn-rounded p-1"
                                                title="View document"
                                                onClick={() => handleView(d)}
                                            >
                                                <Eye size={13} />
                                            </Button>
                                            <Button
                                                variant="flush-dark"
                                                size="sm"
                                                className="btn-icon btn-rounded p-1"
                                                title="Delete document"
                                                onClick={() => deleteDocument(d.id)}
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

const mapStateToProps = ({ documents }) => ({ documents });
export default connect(mapStateToProps, { addDocument, deleteDocument })(DocumentsTab);
