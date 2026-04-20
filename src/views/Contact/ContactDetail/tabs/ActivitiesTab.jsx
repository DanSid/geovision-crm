import React, { useState } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { connect } from 'react-redux';
import { addActivityWithHistory } from '../../../../redux/action/Crm';

const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'To-Do'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const priorityBg = { Low: 'secondary', Medium: 'info', High: 'warning', Urgent: 'danger' };

const emptyForm = {
    type: 'Call', title: '', date: '', time: '', duration: '10 Minutes',
    priority: 'Low', description: '', opportunityId: '',
};

const ActivitiesTab = ({ entityType, entityId, activities, opportunities, addActivityWithHistory }) => {
    const [show, setShow] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const myActivities = activities
        .filter(a => a.entityType === entityType && String(a.entityId) === String(entityId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const linkedOpps = opportunities.filter(o =>
        String(o.contactId) === String(entityId) ||
        String(o.companyId) === String(entityId)
    );

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.date) e.date = 'Date is required';
        return e;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        addActivityWithHistory({ ...form, entityType, entityId });
        setForm(emptyForm);
        setErrors({});
        setShow(false);
    };

    const fmt = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">{myActivities.length} activit{myActivities.length === 1 ? 'y' : 'ies'}</h6>
                <Button size="sm" variant="primary" onClick={() => setShow(true)}>
                    <Plus size={14} className="me-1" />Add Task
                </Button>
            </div>

            {myActivities.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="mb-2">No activities recorded yet.</p>
                    <Button size="sm" variant="outline-primary" onClick={() => setShow(true)}>Add first activity</Button>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Priority</th>
                                <th>Title</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myActivities.map(a => (
                                <tr key={a.id}>
                                    <td>
                                        <Badge bg="light" text="dark" className="border">{a.type}</Badge>
                                    </td>
                                    <td className="fs-7">{a.date || fmt(a.createdAt).split(',')[0]}</td>
                                    <td className="fs-7">{a.time || '—'}</td>
                                    <td>
                                        <Badge bg={priorityBg[a.priority] || 'secondary'} className="fw-normal">
                                            {a.priority}
                                        </Badge>
                                    </td>
                                    <td className="fw-medium fs-7">{a.title}</td>
                                    <td className="fs-7">{a.duration || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Add Activity Modal */}
            <Modal show={show} onHide={() => { setShow(false); setErrors({}); setForm(emptyForm); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title as="h5">Add Activity</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3 p-3 bg-light rounded">
                        <h6 className="mb-3 text-uppercase fs-7 text-muted">SCHEDULING</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <Form.Label className="fs-7">Activity type</Form.Label>
                                <Form.Select size="sm" value={form.type} onChange={e => set('type', e.target.value)}>
                                    {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-8">
                                <Form.Label className="fs-7">Title</Form.Label>
                                <Form.Control size="sm" value={form.title} onChange={e => set('title', e.target.value)}
                                    isInvalid={!!errors.title} placeholder="Activity title" />
                                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                            </div>
                            <div className="col-md-3">
                                <Form.Label className="fs-7">Duration</Form.Label>
                                <Form.Select size="sm" value={form.duration} onChange={e => set('duration', e.target.value)}>
                                    {['10 Minutes','15 Minutes','30 Minutes','1 Hour','2 Hours','All Day'].map(d => <option key={d}>{d}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-4">
                                <Form.Label className="fs-7">Start date</Form.Label>
                                <Form.Control size="sm" type="date" value={form.date} onChange={e => set('date', e.target.value)}
                                    isInvalid={!!errors.date} />
                                <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
                            </div>
                            <div className="col-md-5">
                                <Form.Label className="fs-7">Time</Form.Label>
                                <Form.Control size="sm" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-3 p-3 bg-light rounded">
                        <h6 className="mb-3 text-uppercase fs-7 text-muted">ADDITIONAL DETAILS</h6>
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
                                <Form.Label className="fs-7">Description</Form.Label>
                                <Form.Control as="textarea" rows={3} size="sm" value={form.description}
                                    onChange={e => set('description', e.target.value)} placeholder="Optional notes..." />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => { setShow(false); setErrors({}); setForm(emptyForm); }}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ activities, opportunities }) => ({ activities, opportunities });
export default connect(mapStateToProps, { addActivityWithHistory })(ActivitiesTab);
