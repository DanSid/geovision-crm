import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import {
    Badge, Button, Card, Col, Container, Form, Modal, Row, Table,
} from 'react-bootstrap';
import { addRequest, updateRequest, deleteRequest } from '../../../redux/action/Crm';

// ── Multi-select dropdown ─────────────────────────────────────────────────────
const MultiSelectDropdown = ({ options, selected, onChange, placeholder, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const toggle = (id) => {
        const sid = String(id);
        onChange(selected.includes(sid) ? selected.filter((s) => s !== sid) : [...selected, sid]);
    };

    const labels = options
        .filter((o) => selected.includes(String(o.id)))
        .map((o) => o.label)
        .join(', ');

    return (
        <div ref={ref} className="position-relative">
            <div
                className="form-control d-flex align-items-center justify-content-between"
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                    userSelect: 'none',
                    minHeight: 38,
                }}
                onClick={() => !disabled && setOpen((o) => !o)}
            >
                <span className="text-truncate" style={{ flex: 1, fontSize: 14 }}>
                    {labels || <span className="text-muted">{placeholder}</span>}
                </span>
                <i className={`ri-arrow-${open ? 'up' : 'down'}-s-line ms-2 text-muted`} />
            </div>
            {open && (
                <div
                    className="position-absolute bg-white border rounded shadow-sm p-1"
                    style={{ top: '100%', left: 0, right: 0, zIndex: 1050, maxHeight: 200, overflowY: 'auto' }}
                >
                    {options.length === 0 ? (
                        <div className="text-muted px-2 py-1" style={{ fontSize: 13 }}>No options available</div>
                    ) : (
                        options.map((o) => (
                            <div
                                key={o.id}
                                className="d-flex align-items-center gap-2 px-2 py-1 rounded"
                                style={{ cursor: 'pointer', fontSize: 13 }}
                                onClick={(e) => { e.stopPropagation(); toggle(o.id); }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(String(o.id))}
                                    readOnly
                                    style={{ pointerEvents: 'none' }}
                                />
                                <span>{o.label}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// ── Equipment tag-badge input ─────────────────────────────────────────────────
const EquipmentTagInput = ({ tags, onChange, disabled }) => {
    const [input, setInput] = useState('');

    const commit = (raw) => {
        const tag = raw.trim();
        if (!tag || tags.includes(tag)) return;
        onChange([...tags, tag]);
    };

    const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

    return (
        <div
            className="border rounded px-2 py-1 d-flex flex-wrap gap-1 align-items-center"
            style={{ minHeight: 42, cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.6 : 1 }}
        >
            {tags.map((tag) => (
                <Badge
                    key={tag}
                    bg="primary"
                    className="d-inline-flex align-items-center gap-1 fw-normal"
                    style={{ fontSize: 11 }}
                >
                    {tag}
                    {!disabled && (
                        <span
                            role="button"
                            className="ms-1"
                            style={{ cursor: 'pointer', lineHeight: 1 }}
                            onClick={() => removeTag(tag)}
                        >×</span>
                    )}
                </Badge>
            ))}
            {!disabled && (
                <input
                    className="border-0 bg-transparent flex-grow-1 p-0"
                    style={{ minWidth: 140, outline: 'none', fontSize: 14 }}
                    placeholder={tags.length === 0 ? 'Type equipment and press comma or Enter…' : ''}
                    value={input}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v.endsWith(',')) { commit(v.slice(0, -1)); setInput(''); }
                        else setInput(v);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); commit(input); setInput(''); }
                        if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
                    }}
                />
            )}
        </div>
    );
};

// ── View Request Modal ────────────────────────────────────────────────────────
const ViewRequestModal = ({ request, vehicles, crewMembers, onClose, onPrint }) => {
    if (!request) return null;
    const fmtD = (d) => (d ? new Date(d).toLocaleDateString() : '–');
    const reqVehicles = vehicles.filter((v) => (request.vehicleIds || []).map(String).includes(String(v.id)));
    const reqCrew = crewMembers.filter((c) => (request.crewMemberIds || []).map(String).includes(String(c.id)));

    return (
        <Modal show onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="fs-6">
                    Request — <span className="text-primary">{request.customerName}</span>
                    {request.opportunityName && (
                        <span className="text-muted ms-2 fw-normal" style={{ fontSize: 13 }}>
                            / {request.opportunityName}
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="g-3">
                    <Col md={6}>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Customer</small>
                            <span className="fw-medium">{request.customerName || '–'}</span>
                        </div>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Opportunity</small>
                            <span>{request.opportunityName || '–'}</span>
                        </div>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Start Date</small>
                            <span>{fmtD(request.startDate)}</span>
                        </div>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>End Date</small>
                            <span>{fmtD(request.endDate)}</span>
                        </div>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Created</small>
                            <span>{fmtD(request.createdAt)}</span>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Equipment Needed</small>
                            <div className="d-flex flex-wrap gap-1">
                                {(request.equipmentNeeded || []).length > 0
                                    ? request.equipmentNeeded.map((e) => (
                                        <Badge key={e} bg="primary" className="fw-normal">{e}</Badge>
                                    ))
                                    : <span className="text-muted">–</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Vehicles</small>
                            <div className="d-flex flex-wrap gap-1">
                                {reqVehicles.length > 0
                                    ? reqVehicles.map((v) => (
                                        <Badge key={v.id} bg="success" className="fw-normal">
                                            <i className="ri-car-line me-1" style={{ fontSize: 11 }} />
                                            {v.name || v.registrationNumber}
                                        </Badge>
                                    ))
                                    : <span className="text-muted">–</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3">
                            <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Crew Members</small>
                            <div className="d-flex flex-wrap gap-1">
                                {reqCrew.length > 0
                                    ? reqCrew.map((c) => (
                                        <Badge key={c.id} bg="info" className="fw-normal">
                                            <i className="ri-user-line me-1" style={{ fontSize: 11 }} />
                                            {c.firstName} {c.lastName}
                                        </Badge>
                                    ))
                                    : <span className="text-muted">–</span>
                                }
                            </div>
                        </div>
                        {request.notes && (
                            <div className="mb-3">
                                <small className="text-muted text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Notes</small>
                                <p className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{request.notes}</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={() => onPrint(request)}>
                    <i className="ri-printer-line me-1" /> Print
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '–');

const emptyForm = {
    customerId: '',
    opportunityId: '',
    equipmentNeeded: [],
    vehicleIds: [],
    crewMemberIds: [],
    startDate: '',
    endDate: '',
    notes: '',
};

// ── Main component ────────────────────────────────────────────────────────────
const Requests = ({
    requests = [],
    customers = [],
    opportunities = [],
    vehicles = [],
    crewMembers = [],
    addRequest,
    updateRequest,
    deleteRequest,
}) => {
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [errors, setErrors] = useState({});
    const [showForm, setShowForm] = useState(true);
    const [viewRequest, setViewRequest] = useState(null);

    const vehicleOptions = useMemo(
        () => vehicles.map((v) => ({ id: v.id, label: v.name ? `${v.name} (${v.registrationNumber})` : v.registrationNumber })),
        [vehicles]
    );

    const crewOptions = useMemo(
        () => crewMembers.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}` })),
        [crewMembers]
    );

    const selectedCustomer = useMemo(
        () => customers.find((c) => String(c.id) === String(form.customerId)) || null,
        [customers, form.customerId]
    );

    const customerOpportunities = useMemo(() => {
        if (!selectedCustomer) return [];
        const name = (selectedCustomer.name || '').toLowerCase();
        const company = (selectedCustomer.company || '').toLowerCase();
        const matched = opportunities.filter((opp) => {
            const cn = (opp.contactName || '').toLowerCase();
            const co = (opp.company || '').toLowerCase();
            return cn.includes(name) || name.includes(cn) || co === company || co === name;
        });
        return matched.length > 0 ? matched : opportunities;
    }, [selectedCustomer, opportunities]);

    const selectedOpportunity = useMemo(
        () => customerOpportunities.find((o) => String(o.id) === String(form.opportunityId)) || null,
        [customerOpportunities, form.opportunityId]
    );

    const handleCustomerChange = (customerId) => {
        setForm((f) => ({ ...f, customerId, opportunityId: '', startDate: '', endDate: '' }));
    };

    const handleOpportunityChange = (opportunityId) => {
        const opp = customerOpportunities.find((o) => String(o.id) === String(opportunityId));
        setForm((f) => ({
            ...f,
            opportunityId,
            startDate: opp ? (opp.startDate || opp.start || '').slice(0, 10) : '',
            endDate: opp ? (opp.expectedCloseDate || opp.closeDate || '').slice(0, 10) : '',
        }));
    };

    const set = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
    };

    const validate = () => {
        const e = {};
        if (!form.customerId) e.customerId = 'Required';
        if (!form.opportunityId) e.opportunityId = 'Required';
        if (!form.startDate) e.startDate = 'Required';
        if (!form.endDate) e.endDate = 'Required';
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        const payload = {
            ...form,
            customerName: selectedCustomer?.name || '',
            opportunityName: selectedOpportunity?.name || '',
            vehicleNames: vehicles
                .filter((v) => form.vehicleIds.includes(String(v.id)))
                .map((v) => v.name || v.registrationNumber),
            crewMemberNames: crewMembers
                .filter((c) => form.crewMemberIds.includes(String(c.id)))
                .map((c) => `${c.firstName} ${c.lastName}`),
        };

        if (editing) {
            updateRequest({ ...editing, ...payload });
            setEditing(null);
        } else {
            addRequest(payload);
        }
        setForm(emptyForm);
        setErrors({});
        setShowForm(false);
    };

    const handleEdit = (req) => {
        setEditing(req);
        setForm({
            customerId: String(req.customerId),
            opportunityId: String(req.opportunityId),
            equipmentNeeded: req.equipmentNeeded || [],
            vehicleIds: (req.vehicleIds || []).map(String),
            crewMemberIds: (req.crewMemberIds || []).map(String),
            startDate: req.startDate ? req.startDate.slice(0, 10) : '',
            endDate: req.endDate ? req.endDate.slice(0, 10) : '',
            notes: req.notes || '',
        });
        setErrors({});
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setForm(emptyForm);
        setEditing(null);
        setErrors({});
        setShowForm(false);
    };

    const handlePrint = (req) => {
        const reqVehicles = vehicles
            .filter((v) => (req.vehicleIds || []).map(String).includes(String(v.id)))
            .map((v) => v.name || v.registrationNumber)
            .join(', ') || '–';
        const reqCrew = crewMembers
            .filter((c) => (req.crewMemberIds || []).map(String).includes(String(c.id)))
            .map((c) => `${c.firstName} ${c.lastName}`)
            .join(', ') || '–';
        const equipment = (req.equipmentNeeded || []).join(', ') || '–';

        const win = window.open('', '_blank', 'width=800,height=600');
        win.document.write(`<!DOCTYPE html><html><head>
            <title>Request - ${req.customerName || ''}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 32px; color: #222; }
                h1 { font-size: 22px; color: #0d6efd; margin-bottom: 4px; }
                .meta { color: #888; font-size: 13px; margin-bottom: 28px; }
                table { width: 100%; border-collapse: collapse; font-size: 14px; }
                tr { border-bottom: 1px solid #eee; }
                td { padding: 10px 8px; vertical-align: top; }
                td:first-child { font-weight: 600; color: #555; width: 180px; white-space: nowrap; }
                @media print { body { padding: 0; } }
            </style>
        </head><body>
            <h1>Logistics Request</h1>
            <div class="meta">Printed on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
            <table>
                <tr><td>Customer</td><td>${req.customerName || '–'}</td></tr>
                <tr><td>Opportunity</td><td>${req.opportunityName || '–'}</td></tr>
                <tr><td>Equipment Needed</td><td>${equipment}</td></tr>
                <tr><td>Vehicles</td><td>${reqVehicles}</td></tr>
                <tr><td>Crew Members</td><td>${reqCrew}</td></tr>
                <tr><td>Start Date</td><td>${fmt(req.startDate)}</td></tr>
                <tr><td>End Date</td><td>${fmt(req.endDate)}</td></tr>
                <tr><td>Notes</td><td>${req.notes || '–'}</td></tr>
                <tr><td>Created</td><td>${fmt(req.createdAt)}</td></tr>
            </table>
            <script>window.onload=function(){window.print();window.close();}<\/script>
        </body></html>`);
        win.document.close();
    };

    const getReqVehicleLabels = (req) =>
        vehicles
            .filter((v) => (req.vehicleIds || []).map(String).includes(String(v.id)))
            .map((v) => v.name || v.registrationNumber);

    const getReqCrewLabels = (req) =>
        crewMembers
            .filter((c) => (req.crewMemberIds || []).map(String).includes(String(c.id)))
            .map((c) => `${c.firstName} ${c.lastName}`);

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="pg-title mb-1">Requests</h1>
                    <p className="text-muted mb-0">Manage logistics requests linked to customers and opportunities</p>
                </div>
                {!showForm && (
                    <Button variant="primary" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}>
                        <i className="ri-add-line me-1" /> New Request
                    </Button>
                )}
            </div>

            {/* Request Form */}
            {showForm && (
                <Card className="mb-4">
                    <Card.Header className="fw-semibold">
                        {editing ? 'Edit Request' : 'New Request'}
                    </Card.Header>
                    <Card.Body>
                        <Row className="g-3">
                            {/* Customer */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Customer <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={form.customerId}
                                        onChange={(e) => handleCustomerChange(e.target.value)}
                                        isInvalid={!!errors.customerId}
                                    >
                                        <option value="">— Select customer —</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.customerId}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            {/* Opportunity */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Opportunity <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={form.opportunityId}
                                        onChange={(e) => handleOpportunityChange(e.target.value)}
                                        isInvalid={!!errors.opportunityId}
                                        disabled={!form.customerId}
                                    >
                                        <option value="">— Select opportunity —</option>
                                        {customerOpportunities.map((o) => (
                                            <option key={o.id} value={o.id}>{o.name}{o.stage ? ` (${o.stage})` : ''}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.opportunityId}</Form.Control.Feedback>
                                    {form.customerId && customerOpportunities.length === 0 && (
                                        <Form.Text className="text-warning">No opportunities found for this customer.</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Equipment Needed */}
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>
                                        Equipment Needed{' '}
                                        <span className="text-muted fw-normal" style={{ fontSize: 12 }}>(type and press comma or Enter to add)</span>
                                    </Form.Label>
                                    <EquipmentTagInput
                                        tags={form.equipmentNeeded}
                                        onChange={(tags) => set('equipmentNeeded', tags)}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Vehicles */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Vehicles</Form.Label>
                                    <MultiSelectDropdown
                                        options={vehicleOptions}
                                        selected={form.vehicleIds}
                                        onChange={(ids) => set('vehicleIds', ids)}
                                        placeholder="— Select vehicles —"
                                    />
                                    {vehicleOptions.length === 0 && (
                                        <Form.Text className="text-muted">No vehicles available. Add vehicles in the Vehicles section.</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Crew Members */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Crew Members</Form.Label>
                                    <MultiSelectDropdown
                                        options={crewOptions}
                                        selected={form.crewMemberIds}
                                        onChange={(ids) => set('crewMemberIds', ids)}
                                        placeholder="— Select crew members —"
                                    />
                                    {crewOptions.length === 0 && (
                                        <Form.Text className="text-muted">No crew members available. Add crew members in the Crew Members section.</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Start Date */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => set('startDate', e.target.value)}
                                        isInvalid={!!errors.startDate}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                                    {selectedOpportunity && (
                                        <Form.Text className="text-muted">Pre-filled from opportunity</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* End Date */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) => set('endDate', e.target.value)}
                                        isInvalid={!!errors.endDate}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                                    {selectedOpportunity && (
                                        <Form.Text className="text-muted">Pre-filled from opportunity</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Notes */}
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Optional notes…"
                                        value={form.notes}
                                        onChange={(e) => set('notes', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Save Request'}</Button>
                    </Card.Footer>
                </Card>
            )}

            {/* Requests List */}
            <Card>
                <Card.Header className="d-flex align-items-center justify-content-between">
                    <span className="fw-semibold">All Requests</span>
                    <Badge bg="secondary">{requests.length}</Badge>
                </Card.Header>
                <Card.Body className="p-0">
                    {requests.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="ri-file-list-3-line fs-1 d-block mb-2" />
                            No requests yet. Click <strong>New Request</strong> to get started.
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Customer</th>
                                    <th>Opportunity</th>
                                    <th>Equipment Needed</th>
                                    <th>Vehicles</th>
                                    <th>Crew Members</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Notes</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req, idx) => {
                                    const vLabels = getReqVehicleLabels(req);
                                    const cLabels = getReqCrewLabels(req);
                                    return (
                                        <tr key={req.id}>
                                            <td className="text-muted">{idx + 1}</td>
                                            <td className="fw-medium">{req.customerName || '–'}</td>
                                            <td>{req.opportunityName || '–'}</td>
                                            <td>
                                                {req.equipmentNeeded && req.equipmentNeeded.length > 0
                                                    ? req.equipmentNeeded.map((e) => (
                                                        <Badge key={e} bg="primary" className="me-1 fw-normal" style={{ fontSize: 10 }}>{e}</Badge>
                                                    ))
                                                    : <span className="text-muted">–</span>
                                                }
                                            </td>
                                            <td>
                                                {vLabels.length > 0
                                                    ? vLabels.map((v) => (
                                                        <Badge key={v} bg="success" className="me-1 fw-normal" style={{ fontSize: 10 }}>
                                                            <i className="ri-car-line me-1" style={{ fontSize: 9 }} />{v}
                                                        </Badge>
                                                    ))
                                                    : <span className="text-muted">–</span>
                                                }
                                            </td>
                                            <td>
                                                {cLabels.length > 0
                                                    ? cLabels.map((c) => (
                                                        <Badge key={c} bg="info" className="me-1 fw-normal" style={{ fontSize: 10 }}>
                                                            <i className="ri-user-line me-1" style={{ fontSize: 9 }} />{c}
                                                        </Badge>
                                                    ))
                                                    : <span className="text-muted">–</span>
                                                }
                                            </td>
                                            <td>{fmt(req.startDate)}</td>
                                            <td>{fmt(req.endDate)}</td>
                                            <td>
                                                {req.notes
                                                    ? <span title={req.notes}>{req.notes.length > 25 ? req.notes.slice(0, 25) + '…' : req.notes}</span>
                                                    : <span className="text-muted">–</span>
                                                }
                                            </td>
                                            <td>{fmt(req.createdAt)}</td>
                                            <td>
                                                <div className="d-flex gap-1 flex-nowrap">
                                                    <Button
                                                        size="sm"
                                                        variant="soft-info"
                                                        className="btn-icon btn-rounded"
                                                        title="View details"
                                                        onClick={() => setViewRequest(req)}
                                                    >
                                                        <i className="ri-eye-line" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="soft-secondary"
                                                        className="btn-icon btn-rounded"
                                                        title="Print"
                                                        onClick={() => handlePrint(req)}
                                                    >
                                                        <i className="ri-printer-line" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="soft-primary"
                                                        className="btn-icon btn-rounded"
                                                        title="Edit"
                                                        onClick={() => handleEdit(req)}
                                                    >
                                                        <i className="ri-edit-line" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="soft-danger"
                                                        className="btn-icon btn-rounded"
                                                        title="Delete"
                                                        onClick={() => deleteRequest(req.id)}
                                                    >
                                                        <i className="ri-delete-bin-line" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* View Modal */}
            {viewRequest && (
                <ViewRequestModal
                    request={viewRequest}
                    vehicles={vehicles}
                    crewMembers={crewMembers}
                    onClose={() => setViewRequest(null)}
                    onPrint={handlePrint}
                />
            )}
        </Container>
    );
};

const mapStateToProps = ({ requests, customers, opportunities, vehicles, crewMembers }) => ({
    requests,
    customers,
    opportunities,
    vehicles,
    crewMembers,
});

export default connect(mapStateToProps, { addRequest, updateRequest, deleteRequest })(Requests);
