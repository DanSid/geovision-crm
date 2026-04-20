import React, { useRef } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Paperclip, Trash2, Upload } from 'react-feather';
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

const DocumentsTab = ({ entityType, entityId, documents, addDocument, deleteDocument }) => {
    const fileRef = useRef(null);

    const myDocs = documents
        .filter(d => d.entityType === entityType && String(d.entityId) === String(entityId))
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            addDocument({
                entityType,
                entityId,
                name: file.name,
                type: file.type || 'unknown',
                size: file.size,
            });
        });
        e.target.value = '';
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
                    <p className="fs-7">Click or drag and drop files here</p>
                    <small className="text-muted">(Metadata only — no actual upload to server)</small>
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
                                <th></th>
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
                                    <td>
                                        <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded p-1"
                                            onClick={() => deleteDocument(d.id)}>
                                            <Trash2 size={13} />
                                        </Button>
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
