import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import SimpleBar from 'simplebar-react';
import { UserPlus } from 'react-feather';

import ContactActionBar      from './ContactActionBar';
import ContactPickerPanel    from './ContactPickerPanel';
import ContactDetailEditPanel from './ContactDetailEditPanel';
import ContactListTable      from './ContactListTable';
import EntityTabSet          from '../shared/EntityTabSet';
import SecondaryContactsTab  from '../ContactDetail/tabs/SecondaryContactsTab';

import { addContact, updateContact, deleteContact, addCustomer, updateCustomer } from '../../../redux/action/Crm';
import { getContactName } from '../../../utils/contactWorkspace';
import { showToast } from '../../../components/GlobalToast';

/* ── Standard departments (also used in the Add modal) ───────────────────── */
const DEFAULT_DEPARTMENTS = [
    'Administration', 'Corporate', 'Customer Service', 'Engineering',
    'Facilities', 'Finance/Accounting', 'Human Resources',
    'Information Technology', 'Legal', 'Manufacturing', 'Marketing',
    'Production', 'Public Relations', 'Purchasing', 'Sales',
    'Security', 'Service', 'Shipping', 'Technical Support',
];

const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Rev.', 'Sir', 'Lady'];

/* ── Dept dropdown with add-custom (used in Add modal) ───────────────────── */
const DepartmentSelect = ({ value, onChange, size = 'md' }) => {
    const [customDepts, setCustomDepts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('gv_custom_depts') || '[]'); } catch { return []; }
    });
    const [addingNew, setAddingNew] = useState(false);
    const [newDept, setNewDept]     = useState('');
    const allDepts = useMemo(
        () => [...new Set([...DEFAULT_DEPARTMENTS, ...customDepts])].sort(),
        [customDepts]
    );
    const handleAdd = () => {
        const t = newDept.trim();
        if (!t) return;
        const updated = [...customDepts, t];
        setCustomDepts(updated);
        localStorage.setItem('gv_custom_depts', JSON.stringify(updated));
        onChange(t);
        setNewDept('');
        setAddingNew(false);
    };
    if (addingNew) {
        return (
            <InputGroup size="sm">
                <Form.Control
                    autoFocus placeholder="New department"
                    value={newDept} onChange={e => setNewDept(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingNew(false); }}
                />
                <Button variant="success" size="sm" onClick={handleAdd}>Add</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setAddingNew(false)}>✕</Button>
            </InputGroup>
        );
    }
    return (
        <Form.Select value={value || ''} size={size === 'sm' ? 'sm' : undefined} onChange={e => {
            if (e.target.value === '__add__') setAddingNew(true);
            else onChange(e.target.value);
        }}>
            <option value="">— Department —</option>
            {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
            <option value="__add__">＋ Add new department…</option>
        </Form.Select>
    );
};

/* ── Blank form ──────────────────────────────────────────────────────────── */
const EMPTY = {
    firstName: '', lastName: '', email: '', phone: '',
    workPhone: '', mobile: '', company: '', department: '', designation: '',
    salutation: '', city: '', state: '', country: '', address1: '', address2: '',
    post: '', fax: '', website: '', biography: '', labels: '',
    idStatus: '', referredBy: '', amaScore: '',
    favorite: false, archived: false, pending: false, deleted: false,
};

/* ══════════════════════════════════════════════════════════════════════════
   ContactsWorkspace
══════════════════════════════════════════════════════════════════════════ */
const ContactsWorkspace = ({
    contacts: allContacts = [],
    customers = [],
    addContact,
    updateContact,
    deleteContact,
    addCustomer,
    updateCustomer,
}) => {
    /* ── Sorted visible list ── */
    const contacts = useMemo(
        () => allContacts
            .filter(c => !c.deleted)
            .sort((a, b) => getContactName(a).localeCompare(getContactName(b))),
        [allContacts]
    );

    /* ── State ── */
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [viewMode, setViewMode]           = useState('list');   // 'list' | 'detail'
    const [showAddModal, setShowAddModal]   = useState(false);
    const [form, setForm]                   = useState(EMPTY);
    const [errors, setErrors]               = useState({});
    const [editingContact, setEditingContact] = useState(null);   // for modal

    /* ── Inline edit state (for Detail View) ── */
    const [inlineForm, setInlineForm] = useState(null);

    const photoRef = useRef(null);

    /* ── Derived ── */
    const clamp          = i => Math.max(0, Math.min(contacts.length - 1, i));
    const selectedContact = contacts[clamp(selectedIndex)] ?? null;
    const contactId       = selectedContact ? (selectedContact.id || selectedContact._id) : null;
    const contactName     = selectedContact ? getContactName(selectedContact) : '';

    /* ── Sync inlineForm when selected contact changes ── */
    useEffect(() => {
        if (selectedContact) {
            setInlineForm({ ...EMPTY, ...selectedContact });
        } else {
            setInlineForm(null);
        }
    }, [contactId]); // only reset when ID changes, not on every render

    /* ── isDirty: has inlineForm diverged from selectedContact? ── */
    const isDirty = useMemo(() => {
        if (!inlineForm || !selectedContact) return false;
        const fields = Object.keys(EMPTY);
        return fields.some(k => String(inlineForm[k] ?? '') !== String(selectedContact[k] ?? ''));
    }, [inlineForm, selectedContact]);

    /* ── Navigation ── */
    const goFirst = () => setSelectedIndex(0);
    const goLast  = () => setSelectedIndex(contacts.length - 1);
    const goPrev  = () => setSelectedIndex(i => clamp(i - 1));
    const goNext  = () => setSelectedIndex(i => clamp(i + 1));

    const handleSelect = contact => {
        const idx = contacts.findIndex(c => (c.id || c._id) === (contact.id || contact._id));
        if (idx >= 0) setSelectedIndex(idx);
        setViewMode('detail'); // clicking a row in list view switches to detail
    };

    /* ── Inline field change ── */
    const handleInlineChange = (field, value) =>
        setInlineForm(prev => ({ ...prev, [field]: value }));

    /* ── Save inline edits ── */
    const handleInlineSave = () => {
        if (!selectedContact || !inlineForm) return;
        if (!inlineForm.firstName?.trim()) { showToast('First name is required.', 'danger'); return; }
        if (!inlineForm.email?.trim())     { showToast('Email is required.',      'danger'); return; }

        const editId   = selectedContact.id || selectedContact._id;
        const fullName = `${inlineForm.firstName} ${inlineForm.lastName || ''}`.trim();

        // Duplicate email check (different contact)
        const emailDupe = allContacts.find(c => {
            const cId = c.id || c._id;
            return cId !== editId && c.email && c.email.toLowerCase() === inlineForm.email.toLowerCase() && !c.deleted;
        });
        if (emailDupe) {
            if (!window.confirm(
                `⚠️ "${getContactName(emailDupe)}" already uses this email.\n\nSave anyway?`
            )) return;
        }

        updateContact({ ...selectedContact, ...inlineForm });

        // Sync matching customer
        const mc = customers.find(c => c.contactId === editId || (c.email && c.email === selectedContact.email));
        if (mc) updateCustomer({ ...mc, name: fullName, email: inlineForm.email, phone: inlineForm.phone || mc.phone, company: inlineForm.company || mc.company });

        showToast(`${fullName} saved successfully.`, 'success');
    };

    /* ── Delete contact ── */
    const handleDeleteContact = contact => {
        if (!contact) return;
        if (!window.confirm(`Delete ${getContactName(contact)}? This cannot be undone.`)) return;
        deleteContact(contact.id || contact._id);
        setSelectedIndex(i => clamp(i - 1));
    };

    /* ── Add modal helpers ── */
    const openAdd = () => {
        setEditingContact(null);
        setForm(EMPTY);
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

        const payload  = { ...form, createdAt: form.createdAt || new Date().toISOString() };
        const fullName = `${payload.firstName} ${payload.lastName}`.trim();

        // Duplicate detection (new contact)
        const emailDupe = allContacts.find(c => !c.deleted && c.email && c.email.toLowerCase() === payload.email.toLowerCase());
        const nameDupe  = !emailDupe && allContacts.find(c => !c.deleted && getContactName(c).toLowerCase() === fullName.toLowerCase());

        if (emailDupe) {
            if (!window.confirm(`⚠️ "${getContactName(emailDupe)}" already uses ${payload.email}.\n\nCreate anyway?`)) return;
        } else if (nameDupe) {
            if (!window.confirm(`⚠️ A contact named "${getContactName(nameDupe)}" already exists.\n\nCreate anyway?`)) return;
        }

        addContact(payload);
        addCustomer({ name: fullName, email: payload.email, phone: payload.phone || '', company: payload.company || '', status: 'Active', createdAt: new Date().toLocaleDateString() });
        showToast(`${fullName} added successfully!`, 'success');
        setShowAddModal(false);
    };

    const handlePhotoChange = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setField('photo', ev.target.result);
        reader.readAsDataURL(file);
    };

    /* ── Extra tabs ── */
    const extraTabs = contactId ? [
        { eventKey: 'secondary', label: 'Secondary Contacts', component: <SecondaryContactsTab contactId={contactId} /> },
    ] : [];

    /* ════════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════════ */
    return (
        <div className="hk-pg-body py-0" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

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
                onSaveInline={handleInlineSave}
                onDeleteContact={handleDeleteContact}
                isDirty={isDirty}
            />

            {/* ── Main body ── */}
            <div className="d-flex flex-grow-1" style={{ overflow: 'hidden', minHeight: 0 }}>

                {/* ══ LIST VIEW ══ full-width sortable table */}
                {viewMode === 'list' && (
                    <div className="flex-grow-1" style={{ overflow: 'hidden', minWidth: 0 }}>
                        {contacts.length === 0 ? (
                            <div className="text-center py-7 text-muted">
                                <UserPlus size={52} className="mb-3 opacity-25" />
                                <h5 className="mb-2">No contacts yet</h5>
                                <p className="mb-4 fs-7">Add your first contact to get started</p>
                                <Button variant="primary" size="sm" onClick={openAdd}>
                                    <i className="ri-user-add-line me-1" /> Add Contact
                                </Button>
                            </div>
                        ) : (
                            <ContactListTable
                                contacts={contacts}
                                selectedId={contactId}
                                onSelect={handleSelect}
                            />
                        )}
                    </div>
                )}

                {/* ══ DETAIL VIEW ══ left picker + right editable panels + tabs */}
                {viewMode === 'detail' && (
                    <>
                        {/* Left picker */}
                        <ContactPickerPanel
                            contacts={contacts}
                            selectedId={contactId}
                            onSelect={contact => {
                                const idx = contacts.findIndex(c => (c.id || c._id) === (contact.id || contact._id));
                                if (idx >= 0) setSelectedIndex(idx);
                            }}
                        />

                        {/* Right: editable form + tab set */}
                        <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minWidth: 0 }}>
                            {contacts.length === 0 ? (
                                <div className="text-center py-7 text-muted">
                                    <UserPlus size={52} className="mb-3 opacity-25" />
                                    <h5 className="mb-2">No contacts yet</h5>
                                    <Button variant="primary" size="sm" onClick={openAdd}>
                                        <i className="ri-user-add-line me-1" /> Add Contact
                                    </Button>
                                </div>
                            ) : selectedContact ? (
                                <SimpleBar style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
                                    {/* ── Inline editable 4-panel form ── */}
                                    {inlineForm && (
                                        <ContactDetailEditPanel
                                            form={inlineForm}
                                            onChange={handleInlineChange}
                                        />
                                    )}

                                    {/* ── Tab set (Activities, Notes, Opportunities, etc.) ── */}
                                    <EntityTabSet
                                        entityType="contact"
                                        entityId={contactId}
                                        contactName={contactName}
                                        extraTabs={extraTabs}
                                    />
                                </SimpleBar>
                            ) : null}
                        </div>
                    </>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                ADD CONTACT MODAL
            ═══════════════════════════════════════════════════════════════ */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-6 fw-semibold">Add New Contact</Modal.Title>
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
                                <Form.Control placeholder="First name" value={form.firstName} onChange={e => setField('firstName', e.target.value)} isInvalid={!!errors.firstName} autoFocus />
                                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Last Name</Form.Label>
                                <Form.Control placeholder="Last name" value={form.lastName} onChange={e => setField('lastName', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="email" placeholder="email@example.com" value={form.email} onChange={e => setField('email', e.target.value)} isInvalid={!!errors.email} />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Phone</Form.Label>
                                <Form.Control placeholder="+233 000 000 0000" value={form.phone} onChange={e => setField('phone', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Work Phone</Form.Label>
                                <Form.Control placeholder="Work phone" value={form.workPhone} onChange={e => setField('workPhone', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Company</Form.Label>
                                <Form.Control placeholder="Company name" value={form.company} onChange={e => setField('company', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Department</Form.Label>
                                <DepartmentSelect value={form.department} onChange={v => setField('department', v)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Job Title</Form.Label>
                                <Form.Control placeholder="Job title" value={form.designation} onChange={e => setField('designation', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">City</Form.Label>
                                <Form.Control placeholder="City" value={form.city} onChange={e => setField('city', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-7 fw-semibold">Labels <span className="text-muted fw-normal">(comma-separated)</span></Form.Label>
                                <Form.Control placeholder="e.g. Client, VIP" value={form.labels} onChange={e => setField('labels', e.target.value)} />
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
                                <Form.Control as="textarea" rows={3} placeholder="Short bio or notes…" value={form.biography} onChange={e => setField('biography', e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Create Contact</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ contacts, customers }) => ({ contacts, customers });
export default connect(mapStateToProps, { addContact, updateContact, deleteContact, addCustomer, updateCustomer })(ContactsWorkspace);
