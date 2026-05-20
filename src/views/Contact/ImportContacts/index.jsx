import React, { useCallback, useState } from 'react';
import { Alert, Badge, Button, Container, ProgressBar, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Download, Upload, CheckCircle, XCircle, AlertTriangle } from 'react-feather';
import { FileSpreadsheet } from 'tabler-icons-react';
import { addContactsBatch, addCustomersBatch } from '../../../redux/action/Crm';
import { showToast } from '../../../components/GlobalToast';

/* ── Column map ─────────────────────────────────────────────────────────── */
const COLUMNS = [
    { header: 'First Name*',       field: 'firstName',   required: true  },
    { header: 'Last Name',         field: 'lastName',    required: false },
    { header: 'Email',             field: 'email',       required: false },
    { header: 'Phone',             field: 'phone',       required: false },
    { header: 'Work Phone',        field: 'workPhone',   required: false },
    { header: 'Company',           field: 'company',     required: false },
    { header: 'Department',        field: 'department',  required: false },
    { header: 'Job Title',         field: 'designation', required: false },
    { header: 'City',              field: 'city',        required: false },
    { header: 'State',             field: 'state',       required: false },
    { header: 'Country',           field: 'country',     required: false },
    { header: 'Address',           field: 'address1',    required: false },
    { header: 'Website',           field: 'website',     required: false },
    { header: 'Labels',            field: 'labels',      required: false },
    { header: 'Status',            field: '_status',     required: false },
    { header: 'Biography / Notes', field: 'biography',   required: false },
];

const SAMPLE_ROW = {
    'First Name*': 'Jane', 'Last Name': 'Doe', 'Email': 'jane@example.com',
    'Phone': '+233 024 000 0001', 'Work Phone': '+233 030 000 0001',
    'Company': 'Acme Ltd', 'Department': 'Sales', 'Job Title': 'Sales Manager',
    'City': 'Accra', 'State': 'Greater Accra', 'Country': 'Ghana',
    'Address': '10 Ring Road, Airport City', 'Website': 'https://acme.com',
    'Labels': 'Client, VIP', 'Status': 'Active',
    'Biography / Notes': 'Met at Ghana AI Summit 2025.',
};

/* ── Download template ──────────────────────────────────────────────────── */
const downloadTemplate = () => {
    const headers = COLUMNS.map(c => c.header);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, Object.values(SAMPLE_ROW)]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts Template');
    XLSX.writeFile(wb, 'GeoVision_Contacts_Import_Template.xlsx');
};

/* ── Parse file to raw rows ─────────────────────────────────────────────── */
const parseFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb  = XLSX.read(e.target.result, { type: 'array' });
                const ws  = wb.Sheets[wb.SheetNames[0]];
                resolve(XLSX.utils.sheet_to_json(ws, { defval: '' }));
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });

/* ── Map raw row → contact object + validation errors ───────────────────── */
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
        if (required && !val) errors.push(`Row ${idx + 2}: "First Name" is required.`);
        if (field === '_status') {
            const lower = val.toLowerCase();
            contact.favorite = lower === 'important';
            contact.archived = lower === 'archived';
        } else {
            contact[field] = val;
        }
    });
    if (contact.email && !/\S+@\S+\.\S+/.test(contact.email))
        errors.push(`Row ${idx + 2}: Invalid email "${contact.email}".`);
    return { contact, errors, duplicate: null };
};

/* ── Duplicate detection ────────────────────────────────────────────────── */
const detectDuplicates = (mappedRows, existingContacts) => {
    const seenEmails = new Map(); // normalised email → row index (1-based display)
    const seenNames  = new Map(); // normalised fullname → row index

    return mappedRows.map(({ contact, errors }, i) => {
        // Skip rows that already have validation errors
        if (errors.length > 0) return { contact, errors, duplicate: null };

        const email    = contact.email?.trim().toLowerCase();
        const fullName = `${contact.firstName} ${contact.lastName}`.trim().toLowerCase();

        let duplicate = null;

        // ── 1. Against existing database contacts ──
        if (!duplicate && email) {
            const hit = existingContacts.find(
                c => !c.deleted && c.email?.toLowerCase() === email
            );
            if (hit) {
                const hitName = `${hit.firstName || ''} ${hit.lastName || ''}`.trim() || hit.name || 'existing contact';
                duplicate = `Email already exists (${hitName})`;
            }
        }
        if (!duplicate && fullName) {
            const hit = existingContacts.find(c => {
                if (c.deleted) return false;
                const n = `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase()
                       || (c.name || '').toLowerCase();
                return n && n === fullName;
            });
            if (hit) duplicate = `Name already exists in database`;
        }

        // ── 2. Within-file duplicates (earlier rows take priority) ──
        if (!duplicate && email && seenEmails.has(email)) {
            duplicate = `Duplicate email in file (same as row ${seenEmails.get(email)})`;
        }
        if (!duplicate && fullName && seenNames.has(fullName)) {
            duplicate = `Duplicate name in file (same as row ${seenNames.get(fullName)})`;
        }

        // Register only non-duplicate rows so the first occurrence wins
        if (!duplicate) {
            if (email)    seenEmails.set(email,    i + 1);
            if (fullName) seenNames.set(fullName,  i + 1);
        }

        return { contact, errors, duplicate };
    });
};

/* ══════════════════════════════════════════════════════════════════════════ */
const ImportContacts = ({ contacts: existingContacts = [], addContactsBatch, addCustomersBatch }) => {
    const [rows,       setRows]       = useState([]);
    const [fileName,   setFileName]   = useState('');
    const [importing,  setImporting]  = useState(false);
    const [progress,   setProgress]   = useState(0);
    const [result,     setResult]     = useState(null); // { success, skipped, failed, errors }
    const [parseError, setParseError] = useState('');

    /* ── Dropzone ── */
    const onDrop = useCallback(async (accepted) => {
        const file = accepted[0];
        if (!file) return;
        setFileName(file.name);
        setResult(null);
        setParseError('');
        try {
            const raw    = await parseFile(file);
            const mapped = raw.map((r, i) => mapRow(r, i));
            setRows(detectDuplicates(mapped, existingContacts));
        } catch {
            setParseError('Could not read the file. Ensure it is a valid .xlsx or .csv file.');
            setRows([]);
        }
    }, [existingContacts]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
        },
        multiple: false,
    });

    /* ── Import — batch mode ── */
    const handleImport = async () => {
        const toImport = rows.filter(r => r.errors.length === 0 && !r.duplicate);
        if (!toImport.length) return;

        const skipped = rows.filter(r => r.duplicate).length;
        setImporting(true);
        setProgress(10);

        // Build payloads
        const contactPayloads = toImport.map(({ contact }) => ({
            ...contact,
            createdAt: new Date().toISOString(),
        }));
        const customerPayloads = toImport.map(({ contact }) => ({
            name:      `${contact.firstName} ${contact.lastName}`.trim(),
            email:     contact.email,
            phone:     contact.phone || '',
            company:   contact.company || '',
            status:    'Active',
            createdAt: new Date().toLocaleDateString(),
        }));

        setProgress(20);

        // Batch insert contacts (100 per Supabase request)
        const { saved, failed, errors: batchErrors } = await addContactsBatch(contactPayloads);
        setProgress(70);

        // Batch insert matching customer records
        if (saved > 0) await addCustomersBatch(customerPayloads.slice(0, saved));
        setProgress(100);

        setImporting(false);
        setProgress(0);
        setResult({ success: saved, skipped, failed, errors: batchErrors || [] });
        setRows([]);
        setFileName('');

        if (saved > 0)
            showToast(`${saved} contact${saved !== 1 ? 's' : ''} saved to database successfully!`, 'success');
        if (skipped > 0)
            showToast(`${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped.`, 'warning', 'Duplicates Skipped');
        if (failed > 0)
            showToast(`${failed} record${failed !== 1 ? 's' : ''} failed to save — database rejected the insert. See error details below.`, 'danger', 'Import Error', 15000);
    };

    /* ── Derived counts ── */
    const validCount   = rows.filter(r => r.errors.length === 0 && !r.duplicate).length;
    const invalidCount = rows.filter(r => r.errors.length  >  0).length;
    const dupCount     = rows.filter(r => r.duplicate).length;
    const allErrors    = rows.flatMap(r => r.errors);

    /* ── Row status helper ── */
    const rowClass = ({ errors, duplicate }) => {
        if (errors.length)  return 'table-danger';
        if (duplicate)      return 'table-warning';
        return '';
    };
    const rowIcon = ({ errors, duplicate }) => {
        if (errors.length)  return <XCircle size={13} className="text-danger" />;
        if (duplicate)      return <AlertTriangle size={13} className="text-warning" />;
        return <CheckCircle size={13} className="text-success" />;
    };

    /* ════ RENDER ════ */
    return (
        <div className="hk-pg-wrapper">
            <Container fluid className="py-4 px-4">

                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="mb-1 fw-semibold">Import Contact Records</h4>
                        <p className="text-muted mb-0 fs-7">
                            Bulk-upload contacts from an Excel spreadsheet. Duplicates are detected and skipped automatically.
                        </p>
                    </div>
                    <Button variant="outline-primary" size="sm" onClick={downloadTemplate}
                        className="d-flex align-items-center gap-2">
                        <Download size={15} /> Download Template
                    </Button>
                </div>

                {/* Step 1 */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-start gap-3">
                            <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 flex-shrink-0"
                                style={{ width: 40, height: 40 }}>
                                <span className="fw-bold text-primary" style={{ fontSize: 16 }}>1</span>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-semibold mb-1">Download the Excel Template</h6>
                                <p className="text-muted fs-7 mb-2">
                                    Fill in the template with your contact data. Columns marked with{' '}
                                    <span className="text-danger fw-bold">*</span> are required.
                                    <strong> Status</strong> accepts: <code>Active</code>, <code>Important</code>, or <code>Archived</code>.
                                </p>
                                <Button variant="outline-success" size="sm" onClick={downloadTemplate}
                                    className="d-flex align-items-center gap-2">
                                    <FileSpreadsheet size={14} /> GeoVision_Contacts_Import_Template.xlsx
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-start gap-3">
                            <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 flex-shrink-0"
                                style={{ width: 40, height: 40 }}>
                                <span className="fw-bold text-primary" style={{ fontSize: 16 }}>2</span>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-semibold mb-3">Upload Your Completed Spreadsheet</h6>
                                <div {...getRootProps()}
                                    className={`border-2 border-dashed rounded-3 text-center p-5 ${isDragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                                    style={{ cursor: 'pointer', transition: 'all .2s' }}>
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
                                            <p className="text-muted fs-7 mb-0">Supported: .xlsx, .xls, .csv</p>
                                        </>
                                    )}
                                </div>
                                {fileName && (
                                    <div className="mt-2 d-flex align-items-center gap-2 text-success fs-7">
                                        <FileSpreadsheet size={14} /><strong>{fileName}</strong> loaded
                                    </div>
                                )}
                                {parseError && (
                                    <Alert variant="danger" className="mt-3 mb-0 py-2 fs-7">{parseError}</Alert>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 3: Preview */}
                {rows.length > 0 && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-start gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 flex-shrink-0"
                                    style={{ width: 40, height: 40 }}>
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
                                            {dupCount > 0 && (
                                                <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
                                                    <AlertTriangle size={11} /> {dupCount} duplicate{dupCount !== 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                            {invalidCount > 0 && (
                                                <Badge bg="danger" className="d-flex align-items-center gap-1">
                                                    <XCircle size={11} /> {invalidCount} invalid
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Duplicate notice */}
                                    {dupCount > 0 && (
                                        <Alert variant="warning" className="py-2 fs-7 mb-3 d-flex align-items-start gap-2">
                                            <AlertTriangle size={15} className="flex-shrink-0 mt-1" />
                                            <div>
                                                <strong>{dupCount} duplicate record{dupCount !== 1 ? 's' : ''} detected.</strong>{' '}
                                                These rows are highlighted in yellow and will be <strong>automatically skipped</strong> — they will not be saved to the database.
                                                <ul className="mb-0 mt-1 ps-3">
                                                    {rows.filter(r => r.duplicate).slice(0, 8).map(({ contact, duplicate }, i) => (
                                                        <li key={i}>
                                                            <strong>{contact.firstName} {contact.lastName}</strong> — {duplicate}
                                                        </li>
                                                    ))}
                                                    {dupCount > 8 && <li>…and {dupCount - 8} more.</li>}
                                                </ul>
                                            </div>
                                        </Alert>
                                    )}

                                    {/* Validation errors */}
                                    {allErrors.length > 0 && (
                                        <Alert variant="danger" className="py-2 fs-7 mb-3">
                                            <AlertTriangle size={14} className="me-1" />
                                            <strong>{allErrors.length} validation issue{allErrors.length !== 1 ? 's' : ''}.</strong>{' '}
                                            Red rows will be skipped.
                                            <ul className="mb-0 mt-1 ps-3">
                                                {allErrors.slice(0, 8).map((e, i) => <li key={i}>{e}</li>)}
                                                {allErrors.length > 8 && <li>…and {allErrors.length - 8} more.</li>}
                                            </ul>
                                        </Alert>
                                    )}

                                    {/* Preview table */}
                                    <div style={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                                        <Table size="sm" bordered hover className="fs-7 mb-0">
                                            <thead className="table-dark sticky-top">
                                                <tr>
                                                    <th style={{ width: 36 }}>#</th>
                                                    <th style={{ width: 36 }}></th>
                                                    <th>First Name</th>
                                                    <th>Last Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Company</th>
                                                    <th>Job Title</th>
                                                    <th>City</th>
                                                    <th>Note</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, i) => (
                                                    <tr key={i} className={rowClass(row)}>
                                                        <td>{i + 1}</td>
                                                        <td className="text-center">{rowIcon(row)}</td>
                                                        <td>{row.contact.firstName || <span className="text-danger">—</span>}</td>
                                                        <td>{row.contact.lastName}</td>
                                                        <td>{row.contact.email}</td>
                                                        <td>{row.contact.phone}</td>
                                                        <td>{row.contact.company}</td>
                                                        <td>{row.contact.designation}</td>
                                                        <td>{row.contact.city}</td>
                                                        <td className="text-muted fst-italic" style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {row.duplicate || (row.errors[0] ? row.errors[0].replace(/^Row \d+: /, '') : '')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Legend */}
                                    <div className="d-flex align-items-center gap-3 mt-2 fs-7 text-muted">
                                        <span><CheckCircle size={12} className="text-success me-1" />Will be imported</span>
                                        <span><AlertTriangle size={12} className="text-warning me-1" />Duplicate — will be skipped</span>
                                        <span><XCircle size={12} className="text-danger me-1" />Invalid — will be skipped</span>
                                    </div>

                                    <div className="mt-3 d-flex align-items-center justify-content-between">
                                        <span className="text-muted fs-7">
                                            {rows.length} row{rows.length !== 1 ? 's' : ''} in file
                                            {dupCount > 0 && ` · ${dupCount} duplicate${dupCount !== 1 ? 's' : ''} will be skipped`}
                                        </span>
                                        <Button
                                            variant="primary"
                                            disabled={validCount === 0 || importing}
                                            onClick={handleImport}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <Upload size={14} />
                                            {importing ? 'Importing…' : `Import ${validCount} Contact${validCount !== 1 ? 's' : ''}`}
                                        </Button>
                                    </div>

                                    {importing && (
                                        <div className="mt-2">
                                            <ProgressBar animated now={progress} className="mb-1" style={{ height: 6 }} />
                                            <span className="text-muted fs-7">Saving to database… {progress}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <Alert variant={result.failed === 0 ? 'success' : result.success > 0 ? 'warning' : 'danger'}
                        className="d-flex align-items-start gap-2 mb-4">
                        <CheckCircle size={18} className="flex-shrink-0 mt-1" />
                        <div className="w-100">
                            <strong>Import {result.failed === 0 ? 'complete' : 'finished with errors'}.</strong>
                            <ul className="mb-1 mt-1 ps-3 fs-7">
                                {result.success > 0  && <li className="text-success">{result.success} contact{result.success !== 1 ? 's' : ''} saved to database successfully — will persist after refresh.</li>}
                                {result.skipped > 0  && <li className="text-warning">{result.skipped} duplicate{result.skipped !== 1 ? 's' : ''} skipped (already exist in database).</li>}
                                {result.failed  > 0  && <li className="text-danger"><strong>{result.failed} record{result.failed !== 1 ? 's' : ''} FAILED to save to Supabase</strong> — these will NOT appear after refresh.</li>}
                            </ul>
                            {result.errors?.length > 0 && (
                                <div className="mt-2 p-2 rounded fs-7" style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)' }}>
                                    <strong className="text-danger">Database error details:</strong>
                                    <ul className="mb-0 mt-1 ps-3">
                                        {result.errors.map((e, i) => <li key={i} className="text-danger">{e}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div className="fs-7 mt-2">
                                Go to{' '}
                                <a href="/apps/contacts/contact-list" className="alert-link">Contacts</a>{' '}
                                to view the imported records.
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Column reference */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-bottom py-3">
                        <h6 className="mb-0 fw-semibold">Template Column Reference</h6>
                    </div>
                    <div className="card-body p-0">
                        <Table size="sm" className="mb-0 fs-7">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-3">Column</th>
                                    <th>Required</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COLUMNS.map(c => (
                                    <tr key={c.field}>
                                        <td className="ps-3 fw-semibold">{c.header}</td>
                                        <td>
                                            {c.required
                                                ? <Badge bg="danger" className="fw-normal">Required</Badge>
                                                : <span className="text-muted">Optional</span>}
                                        </td>
                                        <td className="text-muted">
                                            {c.field === '_status'    && 'Active | Important | Archived'}
                                            {c.field === 'labels'     && 'Comma-separated: Client, VIP'}
                                            {c.field === 'email'      && 'Must be valid — used for duplicate detection'}
                                            {c.field === 'firstName'  && 'Cannot be blank — used for duplicate detection'}
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

const mapStateToProps = ({ contacts }) => ({ contacts: contacts || [] });
export default connect(mapStateToProps, { addContactsBatch, addCustomersBatch })(ImportContacts);
