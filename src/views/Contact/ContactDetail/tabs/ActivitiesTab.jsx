import React, { useState } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import { Edit2, Plus, Trash2 } from 'react-feather';
import { connect } from 'react-redux';
import { addActivityWithHistory, updateActivity, deleteActivity } from '../../../../redux/action/Crm';

const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'To-Do'];
const PRIORITIES     = ['Low', 'Medium', 'High', 'Urgent'];
const DURATIONS      = ['5 Minutes','10 Minutes','15 Minutes','30 Minutes','1 Hour','2 Hours','All Day'];

const priorityBg = { Low: 'secondary', Medium: 'info', High: 'warning', Urgent: 'danger' };

const emptyForm = {
    type: 'Call', title: '', date: '', time: '', duration: '30 Minutes',
    priority: 'Low', description: '', opportunityId: '',
};

/* ── Extract YYYY-MM-DD from any date value ────────────────────────────── */
const toDateInput = (val) => {
    if (!val) return '';
    if (String(val).length > 10 && String(val).includes('T')) {
        const dt = new Date(val);
        if (isNaN(dt)) return String(val).slice(0, 10);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return String(val).slice(0, 10);
};

/* ── Extract HH:MM from ISO datetime or explicit time string ────────────── */
const toTimeInput = (dateVal, timeVal) => {
    if (timeVal) return timeVal;
    if (dateVal && String(dateVal).includes('T')) {
        try {
            const dt = new Date(dateVal);
            if (isNaN(dt)) return '';
            return `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
        } catch { return ''; }
    }
    return '';
};

/* ── Format date for display ────────────────────────────────────────────── */
const fmtDate = (val) => {
    if (!val) return '—';
    try {
        return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return val; }
};

/* ── Format time for display ────────────────────────────────────────────── */
const fmtTime = (timeStr, dateVal) => {
    if (timeStr) return timeStr;
    if (dateVal && String(dateVal).includes('T')) {
        try {
            return new Date(dateVal).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch { return '—'; }
    }
    return '—';
};

/* ══════════════════════════════════════════════════════════════════════════
   ActivitiesTab
══════════════════════════════════════════════════════════════════════════ */
const ActivitiesTab = ({
    entityType, entityId,
    activities, opportunities,
    addActivityWithHistory, updateActivity, deleteActivity,
}) => {
    const [show,           setShow]           = useState(false);
    const [editingActivity, setEditingActivity] = useState(null); // null = add mode
    const [form,           setForm]           = useState(emptyForm);
    const [errors,         setErrors]         = useState({});

    const myActivities = activities
        .filter(a => a.entityType === entityType && String(a.entityId) === String(entityId))
        .sort((a, b) => {
            // Sort by scheduled date desc (most recent first)
            const da = new Date(a.date || a.createdAt || 0);
            const db = new Date(b.date || b.createdAt || 0);
            return db - da;
        });

    const linkedOpps = opportunities.filter(o =>
        String(o.contactId) === String(entityId) ||
        String(o.companyId) === String(entityId)
    );

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    /* ── Open modal in ADD mode ── */
    const openAdd = () => {
        setEditingActivity(null);
        setForm(emptyForm);
        setErrors({});
        setShow(true);
    };

    /* ── Open modal in EDIT mode ── */
    const openEdit = (a) => {
        setEditingActivity(a);
        setForm({
            type:          a.type        || 'Call',
            title:         a.title       || '',
            date:          toDateInput(a.date),
            time:          toTimeInput(a.date, a.time),
            duration:      a.duration    || '',
            priority:      a.priority    || 'Low',
            description:   a.description || a.notes || '',
            opportunityId: a.opportunityId || '',
        });
        setErrors({});
        setShow(true);
    };

    const closeModal = () => {
        setShow(false);
        setEditingActivity(null);
        setForm(emptyForm);
        setErrors({});
    };

    /* ── Validate ── */
    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.date)          e.date  = 'Date is required';
        return e;
    };

    /* ── Save (add or update) ── */
    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        if (editingActivity) {
            // EDIT: merge with original activity to preserve id etc.
            updateActivity({
                ...editingActivity,
                ...form,
                id: editingActivity.id || editingActivity._id,
            });
        } else {
            // ADD: new activity + history entry
            addActivityWithHistory({ ...form, entityType, entityId });
        }
        closeModal();
    };

    /* ── Delete ── */
    const handleDelete = (a) => {
        if (!window.confirm(`Delete "${a.title || a.type}"?`)) return;
        deleteActivity(a.id || a._id);
    };

    return (
        <div>
            {/* ── Header row ── */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">
                    {myActivities.length} activit{myActivities.length === 1 ? 'y' : 'ies'}
                </h6>
                <Button size="sm" variant="primary" onClick={openAdd}>
                    <Plus size={14} className="me-1" />Add Activity
                </Button>
            </div>

            {/* ── Empty state ── */}
            {myActivities.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="mb-2">No activities recorded yet.</p>
                    <Button size="sm" variant="outline-primary" onClick={openAdd}>Add first activity</Button>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: 80 }}>Type</th>
                                <th style={{ width: 110 }}>Date</th>
                                <th style={{ width: 90 }}>Time</th>
                                <th style={{ width: 80 }}>Priority</th>
                                <th>Title</th>
                                <th style={{ width: 180 }}>Notes</th>
                                <th style={{ width: 100 }}>Duration</th>
                                <th style={{ width: 72 }} className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myActivities.map(a => (
                                <tr key={a.id || a._id}>
                                    <td>
                                        <Badge bg="light" text="dark" className="border">{a.type}</Badge>
                                    </td>
                                    <td className="fs-7">{fmtDate(a.date || a.createdAt)}</td>
                                    <td className="fs-7">{fmtTime(a.time, a.date)}</td>
                                    <td>
                                        {a.priority ? (
                                            <Badge bg={priorityBg[a.priority] || 'secondary'} className="fw-normal">
                                                {a.priority}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted fs-7">—</span>
                                        )}
                                    </td>
                                    <td className="fw-medium fs-7">{a.title}</td>
                                    <td className="fs-7" style={{ maxWidth: 180 }}>
                                        <span
                                            className="d-inline-block text-truncate"
                                            style={{ maxWidth: 175, verticalAlign: 'middle' }}
                                            title={a.description || a.notes || ''}
                                        >
                                            {a.description || a.notes || '—'}
                                        </span>
                                    </td>
                                    <td className="fs-7">{a.duration || '—'}</td>
                                    <td className="text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-1">
                                            <Button
                                                variant="soft-primary"
                                                size="sm"
                                                className="btn-icon p-1"
                                                title="Edit activity"
                                                onClick={() => openEdit(a)}
                                            >
                                                <Edit2 size={12} />
                                            </Button>
                                            <Button
                                                variant="soft-danger"
                                                size="sm"
                                                className="btn-icon p-1"
                                                title="Delete activity"
                                                onClick={() => handleDelete(a)}
                                            >
                                                <Trash2 size={12} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                ADD / EDIT ACTIVITY MODAL
            ══════════════════════════════════════════════════════════════ */}
            <Modal show={show} onHide={closeModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title as="h5">
                        {editingActivity ? `Edit Activity — ${editingActivity.title || editingActivity.type}` : 'Add Activity'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* ── Scheduling ── */}
                    <div className="mb-3 p-3 bg-light rounded">
                        <h6 className="mb-3 text-uppercase fs-7 text-muted">Scheduling</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <Form.Label className="fs-7">Activity Type</Form.Label>
                                <Form.Select size="sm" value={form.type} onChange={e => set('type', e.target.value)}>
                                    {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-8">
                                <Form.Label className="fs-7">Title <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    size="sm"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    isInvalid={!!errors.title}
                                    placeholder="Activity title"
                                />
                                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                            </div>
                            <div className="col-md-4">
                                <Form.Label className="fs-7">Start Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    size="sm" type="date"
                                    value={form.date}
                                    onChange={e => set('date', e.target.value)}
                                    isInvalid={!!errors.date}
                                />
                                <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
                            </div>
                            <div className="col-md-4">
                                <Form.Label className="fs-7">Time</Form.Label>
                                <Form.Control
                                    size="sm" type="time"
                                    value={form.time}
                                    onChange={e => set('time', e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <Form.Label className="fs-7">Duration</Form.Label>
                                <Form.Select size="sm" value={form.duration} onChange={e => set('duration', e.target.value)}>
                                    <option value="">— Select —</option>
                                    {DURATIONS.map(d => <option key={d}>{d}</option>)}
                                </Form.Select>
                            </div>
                        </div>
                    </div>

                    {/* ── Details ── */}
                    <div className="mb-3 p-3 bg-light rounded">
                        <h6 className="mb-3 text-uppercase fs-7 text-muted">Additional Details</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <Form.Label className="fs-7">Priority</Form.Label>
                                <Form.Select size="sm" value={form.priority} onChange={e => set('priority', e.target.value)}>
                                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                                </Form.Select>
                            </div>
                            {linkedOpps.length > 0 && (
                                <div className="col-md-8">
                                    <Form.Label className="fs-7">Link to Opportunity</Form.Label>
                                    <Form.Select size="sm" value={form.opportunityId} onChange={e => set('opportunityId', e.target.value)}>
                                        <option value="">— None —</option>
                                        {linkedOpps.map(o => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </Form.Select>
                                </div>
                            )}
                            <div className="col-12">
                                <Form.Label className="fs-7">Notes / Description</Form.Label>
                                <Form.Control
                                    as="textarea" rows={3} size="sm"
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Add notes, agenda, or summary…"
                                />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary"   size="sm" onClick={handleSave}>
                        {editingActivity ? 'Update Activity' : 'Save Activity'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ activities, opportunities }) => ({ activities, opportunities });
export default connect(mapStateToProps, {
    addActivityWithHistory,
    updateActivity,
    deleteActivity,
})(ActivitiesTab);
