import React, { useCallback, useRef, useState } from 'react';
import { Alert, Badge, Button, Col, Container, ProgressBar, Row, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Download, Upload, CheckCircle, XCircle, AlertTriangle } from 'react-feather';
import { FileSpreadsheet } from 'tabler-icons-react';
import { addContact, addCustomer } from '../../../redux/action/Crm';
import { showToast } from '../../../components/GlobalToast';

/* ── Column definitions (Excel column header → contact field) ───────────── */
const COLUMNS = [
    { header: 'First Name*',       field: 'firstName',  required: true  },
    { header: 'Last Name',         field: 'lastName',   required: false },
    { header: 'Email',             field: 'email',      required: false },
    { header: 'Phone',             field: 'phone',      required: false },
    { header: 'Work Phone',        field: 'workPhone',  required: false },
    { header: 'Company',           field: 'company',    required: false },
    { header: 'Department',        field: 'department', required: false },
    { header: 'Job Title',         field: 'designation',required: false },
    { header: 'City',              field: 'city',       required: false },
    { header: 'State',             field: 'state',      required: false },
    { header: 'Country',           field: 'country',    required: false },
    { header: 'Address',           field: 'address1',   required: false },
    { header: 'Website',           field: 'website',    required: false },
    { header: 'Labels',            field: 'labels',     required: false },
    { header: 'Status',            field: '_status',    required: false },
    { header: 'Biography / Notes', field: 'biography',  required: false },
];

const SAMPLE_ROW = {
    'First Name*':       'Jane',
    'Last Name':         'Doe',
    'Email':             'jane@example.com',
    'Phone':             '+233 024 000 0001',
    'Work Phone':        '+233 030 000 0001',
    'Company':           'Acme Ltd',
    'Department':        'Sales',
    'Job Title':         'Sales Manager',
    'City':              'Accra',
    'State':             'Greater Accra',
    'Country':           'Ghana',
    'Address':           '10 Ring Road, Airport City',
    'Website':           'https://acme.com',
    'Labels':            'Client, VIP',
    'Status':            'Active',
    'Biography / Notes': 'Met at Ghana AI Summit 2025.',
};

/* ── Build and download the Excel template ──────────────────────────────── */
const downloadTemplate = () => {
    const headers = COLUMNS.map(c => c.header);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, Object.values(SAMPLE_ROW)]);

    // Column widths
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 18) }));

    // Bold header row styling (xlsx CE supports limited styles via cell objects)
    headers.forEach((h, i) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
        if (ws[cellRef]) {
            ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: 'D9E1F2' } } };
        }
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Contacts Template');
    XLSX.writeFile(wb, 'GeoVision_Contacts_Import_Template.xlsx');
};

/* ── Parse uploaded file into row objects ───────────────────────────────── */
const parseFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb  = XLSX.read(e.target.result, { type: 'array' });
                const ws  = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
                resolve(raw);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });

/* ── Map a raw row to a contact payload + validation errors ─────────────── */
const mapRow = (raw, idx) => {
    const errors = [];
    const contact = {
        firstName: '', lastName: '', email: '', phone: '',
        workPhone: '', mobile: '', company: '', department: '', designation: '',
        salutation: '', city: '', state: '', country: '', address1: '', address2: '',
        post: '', fax: '', website: '', biography: '', labels: '',
        favorite: false, archived: false, pending: false, deleted: false,
    };

    COLUMNS.forEach(({ header, field, required }) => {
        const val = String(raw[header] ?? '').trim();
        if (required && !val) {
            errors.push(`Row ${idx + 2}: "${header}" is required.`);
        }
        if (field === '_status') {
            const lower = val.toLowerCase();
            contact.favorite = lower === 'important';
            contact.archived = lower === 'archived';
        } else {
            contact[field] = val;
        }
    });

    // Email format check
    if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) {
        errors.push(`Row ${idx + 2}: Invalid email format "${contact.email}".`);
    }

    return { contact, errors };
};

/* ════════════════════════════════════════════════════════════════════════ */
const ImportContacts = ({ addContact, addCustomer }) => {
    const [rows,        setRows]        = useState([]);   // { contact, errors }[]
    const [fileName,    setFileName]    = useState('');
    const [importing,   setImporting]   = useState(false);
    const [imported,    setImported]    = useState(null); // { success, failed }
    const [parseError,  setParseError]  = useState('');

    /* ── Dropzone ── */
    const onDrop = useCallback(async (accepted) => {
        const file = accepted[0];
        if (!file) return;
        setFileName(file.name);
        setImported(null);
        setParseError('');
        try {
            const raw     = await parseFile(file);
            const mapped  = raw.map((r, i) => mapRow(r, i));
            setRows(mapped);
        } catch {
            setParseError('Could not read the file. Make sure it is a valid .xlsx or .csv file.');
            setRows([]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel':                                          ['.xls'],
            'text/csv':                                                           ['.csv'],
        },
        multiple: false,
    });

    /* ── Import handler ── */
    const handleImport = async () => {
        const valid = rows.filter(r => r.errors.length === 0);
        if (!valid.length) return;

        setImporting(true);
        let success = 0;
        let failed  = 0;

        for (const { contact } of valid) {
            try {
                const fullName = `${contact.firstName} ${contact.lastName}`.trim();
                await addContact({ ...contact, createdAt: new Date().toISOString() });
                addCustomer({
                    name: fullName,
                    email: contact.email,
                    phone: contact.phone || '',
                    company: contact.company || '',
                    status: 'Active',
                    createdAt: new Date().toLocaleDateString(),
                });
                success++;
            } catch {
                failed++;
            }
        }

        setImporting(false);
        setImported({ success, failed });
        setRows([]);
        setFileName('');

        if (success > 0) {
            showToast(
                `${success} contact${success !== 1 ? 's' : ''} imported successfully!`,
                'success'
            );
        }
        if (failed > 0) {
            showToast(`${failed} contact${failed !== 1 ? 's' : ''} failed to import.`, 'danger');
        }
    };

    /* ── Derived counts ── */
    const validCount   = rows.filter(r => r.errors.length === 0).length;
    const invalidCount = rows.filter(r => r.errors.length  >  0).length;
    const allErrors    = rows.flatMap(r => r.errors);

    /* ════ RENDER ════ */
    return (
        <div className="hk-pg-wrapper">
            <Container fluid className="py-4 px-4">

                {/* ── Page header ── */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="mb-1 fw-semibold">Import Contact Records</h4>
                        <p className="text-muted mb-0 fs-7">
                            Bulk-upload contacts from an Excel spreadsheet into the CRM.
                        </p>
                    </div>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={downloadTemplate}
                        className="d-flex align-items-center gap-2"
                    >
                        <Download size={15} />
                        Download Template
                    </Button>
                </div>

                {/* ── Step 1: Download template ── */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-start gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 flex-shrink-0"
                                style={{ width: 40, height: 40 }}
                            >
                                <span className="fw-bold text-primary" style={{ fontSize: 16 }}>1</span>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-semibold mb-1">Download the Excel Template</h6>
                                <p className="text-muted fs-7 mb-2">
                                    Use the template to fill in your contact data. Columns marked with{' '}
                                    <span className="text-danger fw-bold">*</span> are required.
                                    The <strong>Status</strong> column accepts: <code>Active</code>,{' '}
                                    <code>Important</code>, or <code>Archived</code>.
                                </p>
                                <Button variant="outline-success" size="sm" onClick={downloadTemplate} className="d-flex align-items-center gap-2">
                                    <FileSpreadsheet size={14} />
                                    GeoVision_Contacts_Import_Template.xlsx
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Step 2: Upload file ── */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-start gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 flex-shrink-0"
                                style={{ width: 40, height: 40 }}
                            >
                                <span className="fw-bold text-primary" style={{ fontSize: 16 }}>2</span>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-semibold mb-3">Upload Your Completed Spreadsheet</h6>

                                {/* Dropzone */}
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-3 text-center p-5 ${isDragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                                    style={{ cursor: 'pointer', transition: 'all .2s' }}
                                >
                                    <input {...getInputProps()} />
                                    <Upload size={36} className="text-muted mb-3 d-block mx-auto" />
                                    {isDragActive ? (
                                        <p className="text-primary fw-semibold mb-0">Drop the file here…</p>
                                    ) : (
                                        <>
                                            <p className="fw-semibold mb-1">
                                                Drag &amp; drop your Excel file here, or{' '}
                                                <span className="text-primary text-decoration-underline">click to browse</span>
                                            </p>
                                            <p className="text-muted fs-7 mb-0">
                                                Supported formats: .xlsx, .xls, .csv
                                            </p>
                                        </>
                                    )}
                                </div>

                                {fileName && (
                                    <div className="mt-2 d-flex align-items-center gap-2 text-success fs-7">
                                        <FileSpreadsheet size={14} />
                                        <strong>{fileName}</strong> loaded
                                    </div>
                                )}

                                {parseError && (
                                    <Alert variant="danger" className="mt-3 mb-0 py-2 fs-7">
                                        {parseError}
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Step 3: Preview & import ── */}
                {rows.length > 0 && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-start gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 flex-shrink-0"
                                    style={{ width: 40, height: 40 }}
                                >
                                    <span className="fw-bold text-primary" style={{ fontSize: 16 }}>3</span>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h6 className="fw-semibold mb-0">Preview &amp; Confirm</h6>
                                        <div className="d-flex align-items-center gap-2">
                                            {validCount > 0 && (
                                                <Badge bg="success" className="d-flex align-items-center gap-1">
                                                    <CheckCircle size={11} /> {validCount} ready
                                                </Badge>
                                            )}
                                            {invalidCount > 0 && (
                                                <Badge bg="danger" className="d-flex align-items-center gap-1">
                                                    <XCircle size={11} /> {invalidCount} invalid
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Validation errors summary */}
                                    {allErrors.length > 0 && (
                                        <Alert variant="warning" className="py-2 fs-7 mb-3">
                                            <AlertTriangle size={14} className="me-1" />
                                            <strong>{allErrors.length} issue{allErrors.length !== 1 ? 's' : ''} found.</strong>{' '}
                                            Invalid rows will be skipped during import.
                                            <ul className="mb-0 mt-1 ps-3">
                                                {allErrors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                                                {allErrors.length > 10 && <li>…and {allErrors.length - 10} more.</li>}
                                            </ul>
                                        </Alert>
                                    )}

                                    {/* Preview table */}
                                    <div style={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                                        <Table size="sm" bordered hover className="fs-7 mb-0">
                                            <thead className="table-dark sticky-top">
                                                <tr>
                                                    <th style={{ width: 36 }}>#</th>
                                                    <th>Status</th>
                                                    {COLUMNS.slice(0, 8).map(c => (
                                                        <th key={c.field}>{c.header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map(({ contact, errors: rowErrors }, i) => (
                                                    <tr key={i} className={rowErrors.length ? 'table-danger' : ''}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            {rowErrors.length === 0
                                                                ? <CheckCircle size={13} className="text-success" />
                                                                : <XCircle    size={13} className="text-danger" />}
                                                        </td>
                                                        <td>{contact.firstName || <span className="text-danger">—</span>}</td>
                                                        <td>{contact.lastName}</td>
                                                        <td>{contact.email}</td>
                                                        <td>{contact.phone}</td>
                                                        <td>{contact.workPhone}</td>
                                                        <td>{contact.company}</td>
                                                        <td>{contact.department}</td>
                                                        <td>{contact.designation}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    <div className="mt-3 d-flex align-items-center justify-content-between">
                                        <span className="text-muted fs-7">
                                            {rows.length} row{rows.length !== 1 ? 's' : ''} found in file
                                        </span>
                                        <Button
                                            variant="primary"
                                            disabled={validCount === 0 || importing}
                                            onClick={handleImport}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <Upload size={14} />
                                            {importing
                                                ? 'Importing…'
                                                : `Import ${validCount} Contact${validCount !== 1 ? 's' : ''}`}
                                        </Button>
                                    </div>

                                    {importing && (
                                        <ProgressBar animated now={100} className="mt-2" style={{ height: 4 }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Success result ── */}
                {imported && (
                    <Alert
                        variant={imported.failed === 0 ? 'success' : 'warning'}
                        className="d-flex align-items-center gap-2"
                    >
                        <CheckCircle size={18} />
                        <div>
                            <strong>
                                {imported.success} contact{imported.success !== 1 ? 's' : ''} imported
                                {imported.failed > 0 ? `, ${imported.failed} failed` : ' successfully'}.
                            </strong>
                            <div className="fs-7 mt-1">
                                Go to{' '}
                                <a href="/apps/contacts/contact-list" className="alert-link">
                                    Contacts
                                </a>{' '}
                                to view the imported records.
                            </div>
                        </div>
                    </Alert>
                )}

                {/* ── Column reference table ── */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-bottom py-3">
                        <h6 className="mb-0 fw-semibold">Template Column Reference</h6>
                    </div>
                    <div className="card-body p-0">
                        <Table size="sm" className="mb-0 fs-7">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-3">Column</th>
                                    <th>Field</th>
                                    <th>Required</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COLUMNS.map(c => (
                                    <tr key={c.field}>
                                        <td className="ps-3 fw-semibold">{c.header}</td>
                                        <td className="text-muted">{c.field === '_status' ? 'status' : c.field}</td>
                                        <td>
                                            {c.required
                                                ? <Badge bg="danger" className="fw-normal">Required</Badge>
                                                : <span className="text-muted">Optional</span>}
                                        </td>
                                        <td className="text-muted">
                                            {c.field === '_status'   && 'Active | Important | Archived'}
                                            {c.field === 'labels'    && 'Comma-separated: Client, VIP'}
                                            {c.field === 'email'     && 'Must be a valid email address'}
                                            {c.field === 'firstName' && 'Cannot be blank'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>

            </Container>
        </div>
    );
};

const mapStateToProps = () => ({});
export default connect(mapStateToProps, { addContact, addCustomer })(ImportContacts);
