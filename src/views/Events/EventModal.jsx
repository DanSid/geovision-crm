import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { Plus, Trash2 } from 'react-feather';

const LEADS = ['Femi', 'Ellis', 'Peter', 'Femi / Prince', 'Ellis / Mustapha', 'Rev. Edmund', 'Kelvin', 'Other'];
const STATUSES = [
    { value: 'planned',   label: 'Planned' },
    { value: 'upcoming',  label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
];
const BUDGET_STATUSES = [
    { value: '',          label: 'Not set' },
    { value: 'pending',   label: 'Pending approval' },
    { value: 'approved',  label: 'Approved' },
    { value: 'invoiced',  label: 'Invoiced' },
    { value: 'paid',      label: 'Paid' },
];
const ACCOMM = [
    { value: 'no',       label: 'Not required' },
    { value: 'yes',      label: 'Required — arrange' },
    { value: 'arranged', label: 'Arranged' },
];
const DEL_STATUSES = [
    { value: 'planned',     label: 'Planned' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'completed',   label: 'Completed' },
];

const empty = () => ({
    name: '', date: '', setup: '', enddate: '', teardown: '',
    venue: '', lead: 'Femi', status: 'planned',
    client: '', contact: '', team: '', crew: '',
    budget: '', budgetStatus: '', transport: '', accomm: 'no', notes: '',
    deliverables: [],
});

const EventModal = ({ show, onHide, event, onSave, onDelete }) => {
    const [form, setForm]   = useState(empty());
    const [newDel, setNewDel] = useState({ name: '', vendor: '', status: 'planned' });
    const [err, setErr]     = useState('');

    useEffect(() => {
        if (event) {
            setForm({
                ...empty(),
                ...event,
                deliverables: Array.isArray(event.deliverables) ? event.deliverables : [],
            });
        } else {
            setForm(empty());
        }
        setErr('');
        setNewDel({ name: '', vendor: '', status: 'planned' });
    }, [event, show]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const addDel = () => {
        if (!newDel.name.trim()) return;
        setForm(f => ({ ...f, deliverables: [...f.deliverables, { ...newDel }] }));
        setNewDel({ name: '', vendor: '', status: 'planned' });
    };

    const removeDel = (idx) =>
        setForm(f => ({ ...f, deliverables: f.deliverables.filter((_, i) => i !== idx) }));

    const updateDelStatus = (idx, s) =>
        setForm(f => ({
            ...f,
            deliverables: f.deliverables.map((d, i) => i === idx ? { ...d, status: s } : d),
        }));

    const handleSave = () => {
        if (!form.name.trim()) { setErr('Event name is required.'); return; }
        // Flush any partially-filled deliverable row so it isn't lost on save
        const finalForm = newDel.name.trim()
            ? { ...form, deliverables: [...form.deliverables, { ...newDel }] }
            : form;
        onSave(finalForm);
    };

    const delBadge = (s) => {
        if (s === 'completed')  return 'success';
        if (s === 'in_progress') return 'primary';
        return 'warning';
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>{event ? 'Edit Event' : 'New Event'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {err && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{err}</div>}

                {/* Basic Information */}
                <div className="mb-3 pb-2 border-bottom">
                    <div className="fw-semibold mb-2" style={{ fontSize: 13 }}><i className="bi bi-info-circle me-1"></i> Basic information</div>
                    <Row className="g-2">
                        <Col xs={12}>
                            <Form.Label style={{ fontSize: 12 }}>Event name *</Form.Label>
                            <Form.Control size="sm" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. GCHRA Annual Conference 2026" />
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Event date</Form.Label>
                            <Form.Control size="sm" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Setup / load-in date</Form.Label>
                            <Form.Control size="sm" type="date" value={form.setup} onChange={e => set('setup', e.target.value)} />
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Event end date</Form.Label>
                            <Form.Control size="sm" type="date" value={form.enddate} onChange={e => set('enddate', e.target.value)} />
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Teardown date</Form.Label>
                            <Form.Control size="sm" type="date" value={form.teardown} onChange={e => set('teardown', e.target.value)} />
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label style={{ fontSize: 12 }}>Venue / location</Form.Label>
                            <Form.Control size="sm" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Hotel name, address, city" />
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Project lead</Form.Label>
                            <Form.Select size="sm" value={form.lead} onChange={e => set('lead', e.target.value)}>
                                {LEADS.map(l => <option key={l}>{l}</option>)}
                            </Form.Select>
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Status</Form.Label>
                            <Form.Select size="sm" value={form.status} onChange={e => set('status', e.target.value)}>
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </Form.Select>
                        </Col>
                    </Row>
                </div>

                {/* Client & Team */}
                <div className="mb-3 pb-2 border-bottom">
                    <div className="fw-semibold mb-2" style={{ fontSize: 13 }}>Client & team</div>
                    <Row className="g-2">
                        <Col xs={6}>
                            <Form.Label style={{ fontSize: 12 }}>Client / organisation</Form.Label>
                            <Form.Control size="sm" value={form.client} onChange={e => set('client', e.target.value)} placeholder="Client name" />
                        </Col>
                        <Col xs={6}>
                            <Form.Label style={{ fontSize: 12 }}>Client contact</Form.Label>
                            <Form.Control size="sm" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Name, phone or email" />
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label style={{ fontSize: 12 }}>Project team (comma-separated)</Form.Label>
                            <Form.Control size="sm" value={form.team} onChange={e => set('team', e.target.value)} placeholder="Ellis, Gideon, Owura, Biney…" />
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label style={{ fontSize: 12 }}>External crew / support</Form.Label>
                            <Form.Control size="sm" value={form.crew} onChange={e => set('crew', e.target.value)} placeholder="e.g. Kudjo (2 pax), Edem (1 pax)…" />
                        </Col>
                    </Row>
                </div>

                {/* Logistics & Budget */}
                <div className="mb-3 pb-2 border-bottom">
                    <div className="fw-semibold mb-2" style={{ fontSize: 13 }}>Logistics & budget</div>
                    <Row className="g-2">
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Budget (GHS)</Form.Label>
                            <Form.Control size="sm" type="number" min="0" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0" />
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Budget status</Form.Label>
                            <Form.Select size="sm" value={form.budgetStatus} onChange={e => set('budgetStatus', e.target.value)}>
                                {BUDGET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </Form.Select>
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Transport / departure</Form.Label>
                            <Form.Control size="sm" value={form.transport} onChange={e => set('transport', e.target.value)} placeholder="e.g. Team leaves 7am" />
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Label style={{ fontSize: 12 }}>Accommodation</Form.Label>
                            <Form.Select size="sm" value={form.accomm} onChange={e => set('accomm', e.target.value)}>
                                {ACCOMM.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </Form.Select>
                        </Col>
                        <Col xs={12}>
                            <Form.Label style={{ fontSize: 12 }}>Notes / briefing overview</Form.Label>
                            <Form.Control as="textarea" rows={2} size="sm" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Key briefing notes, logistics, special requirements, client instructions…" />
                        </Col>
                    </Row>
                </div>

                {/* Deliverables */}
                <div>
                    <div className="fw-semibold mb-2" style={{ fontSize: 13 }}>Deliverables & items</div>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>List all equipment, services, branding and logistics items required for this event.</p>

                    {form.deliverables.length > 0 && (
                        <div className="mb-2">
                            {form.deliverables.map((d, i) => (
                                <div key={i} className="d-flex align-items-center gap-2 mb-1 p-2 rounded" style={{ background: '#f9fafb', fontSize: 12 }}>
                                    <div style={{ flex: 1 }}>{d.name}</div>
                                    <div style={{ color: '#6b7280', minWidth: 80 }}>{d.vendor}</div>
                                    <Form.Select size="sm" style={{ width: 120 }} value={d.status} onChange={e => updateDelStatus(i, e.target.value)}>
                                        {DEL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </Form.Select>
                                    <Badge bg={delBadge(d.status)} style={{ fontSize: 10 }}>
                                        {DEL_STATUSES.find(s => s.value === d.status)?.label}
                                    </Badge>
                                    <button className="btn btn-sm btn-icon btn-flush-danger" onClick={() => removeDel(i)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="d-flex gap-2 align-items-end">
                        <div style={{ flex: 2 }}>
                            <Form.Label style={{ fontSize: 11 }}>Item</Form.Label>
                            <Form.Control size="sm" value={newDel.name} onChange={e => setNewDel(n => ({ ...n, name: e.target.value }))} placeholder="e.g. LED Screen P3 4m × 2.5m" onKeyDown={e => e.key === 'Enter' && addDel()} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Form.Label style={{ fontSize: 11 }}>Vendor / supplier</Form.Label>
                            <Form.Control size="sm" value={newDel.vendor} onChange={e => setNewDel(n => ({ ...n, vendor: e.target.value }))} placeholder="Vendor name" onKeyDown={e => e.key === 'Enter' && addDel()} />
                        </div>
                        <div>
                            <Form.Label style={{ fontSize: 11 }}>Status</Form.Label>
                            <Form.Select size="sm" value={newDel.status} onChange={e => setNewDel(n => ({ ...n, status: e.target.value }))}>
                                {DEL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </Form.Select>
                        </div>
                        <Button size="sm" variant="primary" onClick={addDel}><Plus size={14} /></Button>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                {event && (
                    <Button variant="danger" size="sm" className="me-auto" onClick={() => onDelete(event.id)}>
                        <Trash2 size={13} className="me-1" /> Delete event
                    </Button>
                )}
                <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save event</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EventModal;
