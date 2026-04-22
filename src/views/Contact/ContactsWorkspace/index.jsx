import React, { useMemo, useRef, useState } from 'react';
import { Badge, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import SimpleBar from 'simplebar-react';
import { UserPlus } from 'react-feather';

import ContactActionBar from './ContactActionBar';
import ContactPickerPanel from './ContactPickerPanel';
import ContactDetailTopPanels from '../ContactDetail/ContactDetailTopPanels';
import EntityTabSet from '../shared/EntityTabSet';
import SecondaryContactsTab from '../ContactDetail/tabs/SecondaryContactsTab';

import { addContact, updateContact, deleteContact, addCustomer } from '../../../redux/action/Crm';
import { getContactName } from '../../../utils/contactWorkspace';

/* ── Blank new-contact form ─────────────────────────────────────────────── */
const EMPTY = {
    firstName: '', lastName: '', email: '', phone: '',
    workPhone: '', company: '', department: '', designation: '',
    city: '', state: '', country: '', biography: '', labels: '',
    favorite: false, archived: false, pending: false, deleted: false,
};

/* ── ContactsWorkspace ──────────────────────────────────────────────────── */
const ContactsWorkspace = ({ contacts: allContacts = [], addContact, updateContact, deleteContact, addCustomer }) => {

    /* ── Sorted visible list ── */
    const contacts = useMemo(() =>
        allContacts
            .filter(c => !c.deleted)
            .sort((a, b) => getContactName(a).localeCompare(getContactName(b))),
        [allContacts]
    );

    /* ── State ── */
    const [selectedIndex, setSelectedIndex]   = useState(0);
    const [viewMode, setViewMode]             = useState('list');   // 'list' | 'detail'
    const [showAddModal, setShowAddModal]     = useState(false);
    const [editingContact, setEditingContact] = useState(null);     // contact being edited
    const [form, setForm]                     = useState(EMPTY);
    const [errors, setErrors]                 = useState({});
    const photoRef = useRef(null);

    /* ── Derived ── */
    const selectedContact = contacts[selectedIndex] ?? null;
    const contactId       = selectedContact ? (selectedContact.id || selectedContact._id) : null;
    const contactName     = selectedContact ? getContactName(selectedContact) : '';

    /* ── Navigation ── */
    const clamp = (i) => Math.max(0, Math.min(contacts.length - 1, i));
    const goFirst  = () => setSelectedIndex(0);
    const goLast   = () => setSelectedIndex(contacts.length - 1);
    const goPrev   = () => setSelectedIndex(i => clamp(i - 1));
    const goNext   = () => setSelectedIndex(i => clamp(i + 1));

    const handleSelect = (contact) => {
        const idx = contacts.findIndex(c => (c.id || c._id) === (contact.id || contact._id));
        if (idx >= 0) setSelectedIndex(idx);
    };

    /* ── Add / Edit modal helpers ── */
    const openAdd = () => {
        setEditingContact(null);
        setForm(EMPTY);
        setErrors({});
        setShowAddModal(true);
    };

    const openEdit = (contact) => {
        setEditingContact(contact);
        setForm({ ...EMPTY, ...contact });
        setErrors({});
        setShowAddModal(true);
    };

    const setField = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    };

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.email.trim())     errs.email     = 'Required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        return errs;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const payload = {
            ...form,
            createdAt: form.createdAt || new Date().toISOString(),
        };

        if (editingContact) {
            updateContact({ ...editingContact, ...payload });
        } else {
            addContact(payload);
            addCustomer({
                name: `${payload.firstName} ${payload.lastName}`.trim(),
                email: payload.email,
                phone: payload.phone || '',
                company: payload.company || '',
                status: 'Active',
                createdAt: new Date().toLocaleDateString(),
            });
        }
        setShowAddModal(false);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setField('photo', ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleDeleteContact = (contact) => {
        if (!window.confirm(`Delete ${getContactName(contact)}? This cannot be undone.`)) return;
        deleteContact(contact.id || contact._id);
        setSelectedIndex(i => clamp(i - 1));
    };

    /* ── Extra tabs for detail view ── */
    const extraTabs = contactId ? [
        {
            eventKey: 'secondary',
            label: 'Secondary Contacts',
            component: <SecondaryContactsTab contactId={contactId} />,
        },
    ] : [];

    /* ════════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════════ */
    return (
        <div
            className="hk-pg-body py-0"
            style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
            {/* ── Top Action Bar ── */}
            <ContactActionBar
                contact={selectedContact}
                contactIndex={selectedIndex}
                contactCount={contacts.length}
                onPrev={goPrev}
                onNext={goNext}
                onFirst={goFirst}
                onLast={goLast}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onCreateContact={openAdd}
            />

            {/* ── Main body ── */}
            <div className="d-flex flex-grow-1" style={{ overflow: 'hidden', minHeight: 0 }}>

                {/* Left picker (List View only) */}
                {viewMode === 'list' && (
                    <ContactPickerPanel
                        contacts={contacts}
                        selectedId={contactId}
                        onSelect={handleSelect}
                    />
                )}

                {/* Right: detail area */}
                <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minWidth: 0 }}>
                    {contacts.length === 0 ? (
                        /* Empty state */
                        <div className="text-center py-7 text-muted">
                            <UserPlus size={52} className="mb-3 opacity-25" />
                            <h5 className="mb-2">No contacts yet</h5>
                            <p className="mb-4 fs-7">Add your first contact to get started</p>
                            <Button variant="primary" size="sm" onClick={openAdd}>
                                <i className="ri-user-add-line me-1" /> Add Contact
                            </Button>
                        </div>
                    ) : selectedContact ? (
                        <SimpleBar style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
                            {/* ── 4-panel summary ── */}
                            <ContactDetailTopPanels contact={selectedContact} />

                            {/* ── Tab set ── */}
                            <EntityTabSet
                                entityType="contact"
                                entityId={contactId}
                                contactName={contactName}
                                extraTabs={extraTabs}
                            />
                        </SimpleBar>
                    ) : null}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                ADD / EDIT CONTACT MODAL
            ═══════════════════════════════════════════════════════════════ */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-6 fw-semibold">
                        {editingContact ? `Edit Contact — ${getContactName(editingContact)}` : 'Add New Contact'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Photo */}
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div
                            className="d-flex align-items-center justify-content-center bg-light border rounded-circle overflow-hidden"
                            style={{ width: 64, height: 64, cursor: 'pointer' }}
                            onClick={() => photoRef.current?.click()}
                        >
                            {form.photo
                                ? <img src={form.photo} alt="" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                                : <i className="ri-user-line" style={{ fontSize: 28, color: '#9ca3af' }} />}
                        </div>
                        <div>
                            <Button variant="outline-secondary" size="sm" onClick={() => photoRef.current?.click()}>
                                Upload Photo
                            </Button>
                            <div className="text-muted mt-1" style={{ fontSize: 11 }}>JPG, PNG up to 5 MB</div>
                        </div>
                        <input type="file" accept="image/*" hidden ref={photoRef} onChange={handlePhotoChange} />
                    </div>

                    <Row className="gx-3">
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">First Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    placeholder="First name"
                                    value={form.firstName}
                                    onChange={e => setField('firstName', e.target.value)}
                                    isInvalid={!!errors.firstName}
                                    autoFocus
                                />
                                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Last Name</Form.Label>
                                <Form.Control
                                    placeholder="Last name"
                                    value={form.lastName}
                                    onChange={e => setField('lastName', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="email@example.com"
                                    value={form.email}
                                    onChange={e => setField('email', e.target.value)}
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Phone</Form.Label>
                                <Form.Control
                                    placeholder="+233 000 000 0000"
                                    value={form.phone}
                                    onChange={e => setField('phone', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Work Phone</Form.Label>
                                <Form.Control
                                    placeholder="Work phone"
                                    value={form.workPhone}
                                    onChange={e => setField('workPhone', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Company</Form.Label>
                                <Form.Control
                                    placeholder="Company name"
                                    value={form.company}
                                    onChange={e => setField('company', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Department</Form.Label>
                                <Form.Control
                                    placeholder="Department"
                                    value={form.department}
                                    onChange={e => setField('department', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Job Title</Form.Label>
                                <Form.Control
                                    placeholder="Job title"
                                    value={form.designation}
                                    onChange={e => setField('designation', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">City</Form.Label>
                                <Form.Control
                                    placeholder="City"
                                    value={form.city}
                                    onChange={e => setField('city', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Labels <span className="text-muted fw-normal">(comma-separated)</span></Form.Label>
                                <Form.Control
                                    placeholder="e.g. Client, VIP"
                                    value={form.labels}
                                    onChange={e => setField('labels', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Status</Form.Label>
                                <Form.Select value={form.favorite ? 'important' : form.archived ? 'archived' : 'all'} onChange={e => {
                                    setField('favorite', e.target.value === 'important');
                                    setField('archived', e.target.value === 'archived');
                                }}>
                                    <option value="all">Active</option>
                                    <option value="important">Important</option>
                                    <option value="archived">Archived</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Biography / Notes</Form.Label>
                                <Form.Control
                                    as="textarea" rows={3}
                                    placeholder="Short bio or notes about this contact…"
                                    value={form.biography}
                                    onChange={e => setField('biography', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editingContact ? 'Save Changes' : 'Create Contact'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ contacts }) => ({ contacts });
export default connect(mapStateToProps, { addContact, updateContact, deleteContact, addCustomer })(ContactsWorkspace);
