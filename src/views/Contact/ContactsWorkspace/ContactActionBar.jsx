import React, { useState } from 'react';
import { Button, Dropdown, Form, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    List, Layout, Mail, Clock, FileText, CheckSquare, Calendar, Phone, Plus,
} from 'react-feather';
import { getContactName } from '../../../utils/contactWorkspace';
import { addNote, addTask, addActivity, addHistoryEntry } from '../../../redux/action/Crm';

/* ── Tiny re-usable modal shell ────────────────────────────────────────── */
const QModal = ({ show, onHide, title, onSave, saveLabel = 'Save', disabled, children }) => (
    <Modal show={show} onHide={onHide} centered size="md">
        <Modal.Header closeButton className="py-3">
            <Modal.Title className="fs-6 fw-semibold">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer className="py-2">
            <Button variant="outline-secondary" size="sm" onClick={onHide}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={disabled}>{saveLabel}</Button>
        </Modal.Footer>
    </Modal>
);

/* ── Main component ─────────────────────────────────────────────────────── */
const ContactActionBar = ({
    contact,
    contactIndex,
    contactCount,
    onPrev,
    onNext,
    onFirst,
    onLast,
    viewMode,
    onViewModeChange,
    onCreateContact,
    /* Redux actions */
    addNote,
    addTask,
    addActivity,
    addHistoryEntry,
}) => {
    const [modal, setModal] = useState(null); // 'note' | 'task' | 'meeting' | 'call' | 'history'
    const [fd, setFd] = useState({});         // form data

    const name    = contact ? getContactName(contact) : '';
    const cId     = contact ? (contact.id || contact._id) : null;
    const hasContact = !!contact;

    const open  = (key) => { setFd({}); setModal(key); };
    const close = ()    => { setModal(null); setFd({}); };
    const set   = (k, v) => setFd(prev => ({ ...prev, [k]: v }));

    /* ── Save handlers ── */
    const saveNote = () => {
        addNote({ entityType: 'contact', entityId: cId, text: fd.text || '' });
        close();
    };

    const saveTask = () => {
        addTask({
            title: fd.title || 'New Task',
            description: fd.description || '',
            status: 'todo',
            priority: 'medium',
            dueDate: fd.dueDate || '',
            contactId: cId,
            contactName: name,
        });
        close();
    };

    const saveActivity = (type) => {
        addActivity({
            entityType: 'contact',
            entityId: cId,
            type,
            title: fd.title || `${type} with ${name}`,
            description: fd.description || '',
            date: fd.date || new Date().toISOString(),
            completed: false,
        });
        close();
    };

    const saveHistory = () => {
        addHistoryEntry({
            entityType: 'contact',
            entityId: cId,
            action: fd.action || 'note',
            description: fd.description || '',
        });
        close();
    };

    /* ── Action button definition ── */
    const actionBtns = [
        {
            label: 'E-mail', icon: <Mail size={13} />, variant: 'outline-primary',
            onClick: () => contact?.email && window.open(`mailto:${contact.email}`, '_blank'),
            disabled: !contact?.email,
            title: contact?.email ? `Send email to ${contact.email}` : 'No email address on file',
        },
        {
            label: 'History', icon: <Clock size={13} />, variant: 'outline-secondary',
            onClick: () => open('history'),
            title: 'Log a history entry for this contact',
        },
        {
            label: 'Note', icon: <FileText size={13} />, variant: 'outline-secondary',
            onClick: () => open('note'),
            title: 'Add a note to this contact',
        },
        {
            label: 'To-Do', icon: <CheckSquare size={13} />, variant: 'outline-secondary',
            onClick: () => open('task'),
            title: 'Create a task linked to this contact',
        },
        {
            label: 'Meeting', icon: <Calendar size={13} />, variant: 'outline-secondary',
            onClick: () => open('meeting'),
            title: 'Schedule a meeting with this contact',
        },
        {
            label: 'Call', icon: <Phone size={13} />, variant: 'outline-secondary',
            onClick: () => open('call'),
            title: 'Log a call with this contact',
        },
    ];

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════════
                ACTION BAR
            ═══════════════════════════════════════════════════════════════ */}
            <div
                className="border-bottom bg-white"
                style={{ padding: '10px 16px', flexShrink: 0 }}
            >
                {/* ── Row 1: Title · contact name · pagination · view toggle · create ── */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">

                    {/* Left: title + contact nav */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="fw-bold fs-5 text-dark">Contacts</span>

                        {contact && (
                            <>
                                <div className="vr" />
                                <span className="fw-semibold fs-7 text-primary text-truncate" style={{ maxWidth: 200 }}>
                                    {name}
                                </span>

                                {/* Pagination arrows */}
                                <div className="d-flex align-items-center gap-1 ms-1">
                                    <Button variant="outline-secondary" size="sm" className="btn-icon p-1"
                                        title="First contact" onClick={onFirst} style={{ width: 26, height: 26 }}>
                                        <ChevronsLeft size={12} />
                                    </Button>
                                    <Button variant="outline-secondary" size="sm" className="btn-icon p-1"
                                        title="Previous contact" onClick={onPrev} style={{ width: 26, height: 26 }}>
                                        <ChevronLeft size={12} />
                                    </Button>
                                    <span className="text-muted px-1" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                                        {contactIndex + 1} of {contactCount}
                                    </span>
                                    <Button variant="outline-secondary" size="sm" className="btn-icon p-1"
                                        title="Next contact" onClick={onNext} style={{ width: 26, height: 26 }}>
                                        <ChevronRight size={12} />
                                    </Button>
                                    <Button variant="outline-secondary" size="sm" className="btn-icon p-1"
                                        title="Last contact" onClick={onLast} style={{ width: 26, height: 26 }}>
                                        <ChevronsRight size={12} />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: view toggle + create new */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="btn-group" role="group" aria-label="View mode">
                            <Button
                                size="sm"
                                variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                                className="d-flex align-items-center gap-1"
                                title="List View — show contacts list alongside detail"
                                onClick={() => onViewModeChange('list')}
                            >
                                <List size={13} /> List View
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'detail' ? 'primary' : 'outline-secondary'}
                                className="d-flex align-items-center gap-1"
                                title="Detail View — full-width contact detail"
                                onClick={() => onViewModeChange('detail')}
                            >
                                <Layout size={13} /> Detail View
                            </Button>
                        </div>

                        <Dropdown>
                            <Dropdown.Toggle size="sm" variant="primary" className="d-flex align-items-center gap-1">
                                <Plus size={13} /> Create New
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                                <Dropdown.Item onClick={onCreateContact}>
                                    <i className="ri-user-add-line me-2" />New Contact
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => open('note')} disabled={!hasContact}>
                                    <i className="ri-file-text-line me-2" />New Note
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => open('task')} disabled={!hasContact}>
                                    <i className="ri-checkbox-line me-2" />New Task
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => open('meeting')} disabled={!hasContact}>
                                    <i className="ri-calendar-event-line me-2" />New Meeting
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => open('call')} disabled={!hasContact}>
                                    <i className="ri-phone-line me-2" />Log Call
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => open('history')} disabled={!hasContact}>
                                    <i className="ri-history-line me-2" />Log History
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {/* ── Row 2: Quick-action buttons ── */}
                <div className="d-flex align-items-center gap-1 flex-wrap">
                    {actionBtns.map(({ label, icon, variant, onClick, disabled: dis, title }) => (
                        <Button
                            key={label}
                            size="sm"
                            variant={variant}
                            className="d-flex align-items-center gap-1"
                            title={title}
                            onClick={onClick}
                            disabled={dis || !hasContact}
                            style={{ fontSize: 12 }}
                        >
                            {icon} {label}
                        </Button>
                    ))}

                    <div className="vr mx-1" />

                    {/* Contact Actions dropdown */}
                    <Dropdown>
                        <Dropdown.Toggle size="sm" variant="outline-secondary" style={{ fontSize: 12 }}>
                            Contact Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item disabled={!hasContact}>
                                <i className="ri-edit-line me-2" />Edit Contact
                            </Dropdown.Item>
                            <Dropdown.Item disabled={!hasContact}>
                                <i className="ri-archive-line me-2" />Archive Contact
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" disabled={!hasContact}>
                                <i className="ri-delete-bin-line me-2" />Delete Contact
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                QUICK-CREATE MODALS
            ═══════════════════════════════════════════════════════════════ */}

            {/* Note */}
            <QModal
                show={modal === 'note'} onHide={close}
                title={`Add Note — ${name}`}
                onSave={saveNote} saveLabel="Save Note"
                disabled={!fd.text?.trim()}
            >
                <Form.Group>
                    <Form.Label className="fs-7 fw-semibold">Note</Form.Label>
                    <Form.Control
                        as="textarea" rows={4}
                        placeholder="Write a note about this contact…"
                        value={fd.text || ''}
                        onChange={e => set('text', e.target.value)}
                        autoFocus
                    />
                </Form.Group>
            </QModal>

            {/* Task / To-Do */}
            <QModal
                show={modal === 'task'} onHide={close}
                title={`New Task — ${name}`}
                onSave={saveTask} saveLabel="Create Task"
                disabled={!fd.title?.trim()}
            >
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Task Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        placeholder="e.g. Follow up with client"
                        value={fd.title || ''}
                        onChange={e => set('title', e.target.value)}
                        autoFocus
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Priority</Form.Label>
                    <Form.Select value={fd.priority || 'medium'} onChange={e => set('priority', e.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Due Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={fd.dueDate || ''}
                        onChange={e => set('dueDate', e.target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className="fs-7 fw-semibold">Description</Form.Label>
                    <Form.Control
                        as="textarea" rows={2}
                        placeholder="Optional description…"
                        value={fd.description || ''}
                        onChange={e => set('description', e.target.value)}
                    />
                </Form.Group>
            </QModal>

            {/* Meeting */}
            <QModal
                show={modal === 'meeting'} onHide={close}
                title={`Schedule Meeting — ${name}`}
                onSave={() => saveActivity('Meeting')} saveLabel="Schedule Meeting"
                disabled={!fd.title?.trim()}
            >
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Meeting Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        placeholder="e.g. Quarterly review"
                        value={fd.title || ''}
                        onChange={e => set('title', e.target.value)}
                        autoFocus
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Date &amp; Time</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={fd.date || ''}
                        onChange={e => set('date', e.target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className="fs-7 fw-semibold">Notes</Form.Label>
                    <Form.Control
                        as="textarea" rows={2}
                        placeholder="Agenda, location, etc."
                        value={fd.description || ''}
                        onChange={e => set('description', e.target.value)}
                    />
                </Form.Group>
            </QModal>

            {/* Call */}
            <QModal
                show={modal === 'call'} onHide={close}
                title={`Log Call — ${name}`}
                onSave={() => saveActivity('Call')} saveLabel="Log Call"
                disabled={!fd.title?.trim()}
            >
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Call Subject <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        placeholder="e.g. Follow-up call re: proposal"
                        value={fd.title || ''}
                        onChange={e => set('title', e.target.value)}
                        autoFocus
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Date &amp; Time</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={fd.date || ''}
                        onChange={e => set('date', e.target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className="fs-7 fw-semibold">Call Notes</Form.Label>
                    <Form.Control
                        as="textarea" rows={2}
                        placeholder="What was discussed…"
                        value={fd.description || ''}
                        onChange={e => set('description', e.target.value)}
                    />
                </Form.Group>
            </QModal>

            {/* History */}
            <QModal
                show={modal === 'history'} onHide={close}
                title={`Log History — ${name}`}
                onSave={saveHistory} saveLabel="Log Entry"
                disabled={!fd.description?.trim()}
            >
                <Form.Group className="mb-3">
                    <Form.Label className="fs-7 fw-semibold">Action Type</Form.Label>
                    <Form.Select value={fd.action || 'note'} onChange={e => set('action', e.target.value)}>
                        <option value="note">Note</option>
                        <option value="email">Email</option>
                        <option value="call">Call</option>
                        <option value="meeting">Meeting</option>
                        <option value="updated">Updated Record</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label className="fs-7 fw-semibold">Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        as="textarea" rows={3}
                        placeholder="Describe what happened…"
                        value={fd.description || ''}
                        onChange={e => set('description', e.target.value)}
                        autoFocus
                    />
                </Form.Group>
            </QModal>
        </>
    );
};

export default connect(null, { addNote, addTask, addActivity, addHistoryEntry })(ContactActionBar);
