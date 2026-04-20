import React, { useEffect, useMemo, useRef, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Button, Badge, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { addContact, updateContact, deleteContact, addCustomer } from '../../../redux/action/Crm';
import { filterContacts, formatContactSubtitle, getContactInitials, getContactLabels, getContactName, getContactStatus } from '../../../utils/contactWorkspace';

const emptyForm = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    workPhone: '',
    department: '',
    company: '',
    designation: '',
    website: '',
    city: '',
    state: '',
    country: '',
    biography: '',
    labels: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    gmail: '',
    status: 'all',
    favorite: false,
    archived: false,
    pending: false,
    deleted: false,
    companyId: null,
    photo: null,
    contactSource: '',
};

const statusOptions = [
    { value: 'all', label: 'All Contacts' },
    { value: 'important', label: 'Important' },
    { value: 'archived', label: 'Archived' },
    { value: 'pending', label: 'Pending' },
    { value: 'deleted', label: 'Deleted' },
];

// Tag badge input (comma or Enter to add)
const TagInput = ({ value, onChange, placeholder, max }) => {
    const [input, setInput] = useState('');
    const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

    const addTag = (raw) => {
        const tag = raw.trim();
        if (!tag) return;
        if (max && tags.length >= max) return;
        if (!tags.includes(tag)) onChange([...tags, tag].join(', '));
    };

    const removeTag = (tag) => onChange(tags.filter(t => t !== tag).join(', '));

    return (
        <div
            className="border rounded px-2 py-1 d-flex flex-wrap gap-1 align-items-center"
            style={{ minHeight: 42, cursor: 'text' }}
        >
            {tags.map((tag) => (
                <Badge key={tag} bg="primary" className="d-inline-flex align-items-center gap-1 fw-normal" style={{ fontSize: 11 }}>
                    {tag}
                    <span
                        role="button"
                        className="ms-1"
                        style={{ cursor: 'pointer', lineHeight: 1 }}
                        onClick={() => removeTag(tag)}
                    >×</span>
                </Badge>
            ))}
            <input
                className="border-0 bg-transparent flex-grow-1 p-0"
                style={{ minWidth: 120, outline: 'none', fontSize: 14 }}
                placeholder={tags.length === 0 ? placeholder : ''}
                value={input}
                onChange={(e) => {
                    const v = e.target.value;
                    if (v.endsWith(',')) {
                        addTag(v.slice(0, -1));
                        setInput('');
                    } else {
                        setInput(v);
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag(input); setInput(''); }
                    if (e.key === 'Backspace' && !input && tags.length) {
                        removeTag(tags[tags.length - 1]);
                    }
                }}
            />
        </div>
    );
};

const ContactAppBody = ({
    contacts = [],
    addContact,
    updateContact,
    deleteContact,
    addCustomer,
    activeFilter = 'all',
    activeLabel = 'all',
    createContactSignal,
}) => {
    const history = useHistory();
    const photoRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showQuick, setShowQuick] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (contact) => {
        setEditing(contact);
        setForm({
            ...emptyForm,
            ...contact,
            labels: getContactLabels(contact).join(', '),
            status: getContactStatus(contact),
            favorite: !!contact.favorite || !!contact.starred || !!contact.stared || !!contact.important,
            archived: !!contact.archived || !!contact.isArchived,
            pending: !!contact.pending || !!contact.isPending,
            deleted: !!contact.deleted || !!contact.isDeleted,
        });
        setErrors({});
        setShowModal(true);
    };

    useEffect(() => {
        if (createContactSignal) openAdd();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createContactSignal]);

    const validate = () => {
        const nextErrors = {};
        if (!form.firstName.trim()) nextErrors.firstName = 'Required';
        if (!form.email.trim()) nextErrors.email = 'Required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Invalid email';
        return nextErrors;
    };

    const normalizePayload = (values) => ({
        ...values,
        labels: values.labels,
        tags: values.labels,
        favorite: values.status === 'important' || values.favorite,
        archived: values.status === 'archived' || values.archived,
        pending: values.status === 'pending' || values.pending,
        deleted: values.status === 'deleted' || values.deleted,
        createdAt: values.createdAt || new Date().toISOString(),
    });

    const handleSave = () => {
        const nextErrors = validate();
        if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

        const payload = normalizePayload(form);
        if (editing) {
            updateContact({ ...editing, ...payload });
        } else {
            addContact(payload);
            // Auto-create a Customer entry for this contact
            addCustomer({
                name: `${payload.firstName} ${payload.middleName || ''} ${payload.lastName}`.replace(/\s+/g, ' ').trim(),
                email: payload.email,
                phone: payload.phone || payload.workPhone || '',
                company: payload.company || '',
                status: 'Active',
                address: [payload.city, payload.state, payload.country].filter(Boolean).join(', '),
                notes: payload.biography || '',
                createdAt: new Date().toLocaleDateString(),
            });
        }
        setShowModal(false);
    };

    const handleChange = (field, value) => {
        setForm(current => ({ ...current, [field]: value }));
        if (errors[field]) setErrors(current => { const n = { ...current }; delete n[field]; return n; });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => handleChange('photo', ev.target.result);
        reader.readAsDataURL(file);
    };

    const [quickForm, setQuickForm] = useState(emptyForm);
    const handleQuickCreate = () => {
        if (!quickForm.firstName.trim() || !quickForm.email.trim()) return;
        const payload = normalizePayload(quickForm);
        addContact(payload);
        addCustomer({
            name: `${payload.firstName} ${payload.lastName}`.trim(),
            email: payload.email,
            phone: payload.phone || '',
            company: payload.company || '',
            status: 'Active',
            createdAt: new Date().toLocaleDateString(),
        });
        setQuickForm(emptyForm);
        setShowQuick(false);
    };

    const filtered = useMemo(() => filterContacts(contacts, searchTerm, activeFilter, activeLabel), [contacts, searchTerm, activeFilter, activeLabel]);

    const statusBadge = (contact) => {
        const status = getContactStatus(contact);
        const variants = { important: 'warning', archived: 'secondary', pending: 'info', deleted: 'danger', all: 'success' };
        return <Badge bg={variants[status] || 'success'} className="fw-normal text-capitalize">{status}</Badge>;
    };

    return (
        <div className="contact-body">
            <SimpleBar className="nicescroll-bar">
                {showQuick && (
                    <div className="quick-access-form-wrap px-3 pt-3">
                        <Form className="quick-access-form border p-3 rounded mb-3">
                            <Row className="gx-3">
                                <Col lg={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Control placeholder="First name*" value={quickForm.firstName} onChange={e => setQuickForm(f => ({ ...f, firstName: e.target.value }))} />
                                    </Form.Group>
                                </Col>
                                <Col lg={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Control placeholder="Last name" value={quickForm.lastName} onChange={e => setQuickForm(f => ({ ...f, lastName: e.target.value }))} />
                                    </Form.Group>
                                </Col>
                                <Col lg={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Control placeholder="Email*" value={quickForm.email} onChange={e => setQuickForm(f => ({ ...f, email: e.target.value }))} />
                                    </Form.Group>
                                </Col>
                                <Col lg={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Control placeholder="Phone" value={quickForm.phone} onChange={e => setQuickForm(f => ({ ...f, phone: e.target.value }))} />
                                    </Form.Group>
                                </Col>
                                <Col lg={12} className="d-flex gap-2">
                                    <Button variant="primary" size="sm" onClick={handleQuickCreate}>Create</Button>
                                    <Button variant="secondary" size="sm" onClick={() => setShowQuick(false)}>Discard</Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                )}

                <div className="contact-list-view px-3 py-3">
                    <Row className="mb-3 align-items-center">
                        <Col xs={12} xl={7} className="mb-2 mb-xl-0">
                            <div className="contact-toolbar-left d-flex flex-wrap gap-2 align-items-center">
                                <Button size="sm" variant="primary" onClick={openAdd}>
                                    <i className="ri-add-line me-1" /> Add Contact
                                </Button>
                                <Button size="sm" variant="outline-secondary" onClick={() => setShowQuick(!showQuick)}>
                                    Quick Add
                                </Button>
                                <Form.Select size="sm" className="w-auto" value={activeFilter} disabled>
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xs={12} xl={5}>
                            <div className="contact-toolbar-right d-flex justify-content-xl-end">
                                <div className="dataTables_filter w-100 w-xl-auto">
                                    <Form.Label className="w-100 mb-0">
                                        <Form.Control size="sm" type="search" placeholder="Search contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </Form.Label>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="ri-contacts-book-line fs-1 d-block mb-2" />
                            {searchTerm ? 'No contacts match your search.' : 'No contacts yet. Click "Add Contact" to get started.'}
                        </div>
                    ) : (
                        <Table hover responsive className="mb-5">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Labels</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(contact => (
                                    <tr key={contact.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {contact.photo ? (
                                                    <img src={contact.photo} alt="" style={{ width: 30, height: 30, minWidth: 30, borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="avatar avatar-xs avatar-rounded d-flex align-items-center justify-content-center text-white fw-bold" style={{ background: '#4f46e5', width: 30, height: 30, minWidth: 30, fontSize: 12 }}>
                                                        {getContactInitials(contact)}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="fw-medium d-block">{getContactName(contact)}</span>
                                                    <span className="text-muted fs-8">{formatContactSubtitle(contact) || 'No company assigned'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{statusBadge(contact)}</td>
                                        <td>{contact.email || '-'}</td>
                                        <td>{contact.phone || '-'}</td>
                                        <td>{contact.department || '-'}</td>
                                        <td>
                                            {getContactLabels(contact).length ? getContactLabels(contact).map((label, index) => (
                                                <Badge key={`${contact.id}-${label}-${index}`} bg="primary" className="me-1 fw-normal" style={{ fontSize: 10 }}>{label}</Badge>
                                            )) : '-'}
                                        </td>
                                        <td>{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <Button size="sm" variant="soft-info" className="me-1 btn-icon btn-rounded" onClick={() => history.push(`/apps/contacts/detail/${contact.id}`)}>
                                                <i className="ri-eye-line" />
                                            </Button>
                                            <Button size="sm" variant="soft-primary" className="me-1 btn-icon btn-rounded" onClick={() => openEdit(contact)}>
                                                <i className="ri-edit-line" />
                                            </Button>
                                            <Button size="sm" variant="soft-danger" className="btn-icon btn-rounded" onClick={() => deleteContact(contact.id)}>
                                                <i className="ri-delete-bin-line" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </SimpleBar>

            {/* Add / Edit Contact Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>{editing ? 'Edit Contact' : 'Create New Contact'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Photo + Biography row */}
                    <Row className="g-3 mb-3">
                        <Col xs="auto">
                            <div
                                className="border border-dashed rounded d-flex flex-column align-items-center justify-content-center"
                                style={{ width: 90, height: 90, cursor: 'pointer', overflow: 'hidden' }}
                                onClick={() => photoRef.current?.click()}
                            >
                                {form.photo ? (
                                    <img src={form.photo} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <i className="ri-upload-2-line fs-3 text-muted" />
                                        <span className="text-muted" style={{ fontSize: 11 }}>Upload<br />Photo</span>
                                    </>
                                )}
                            </div>
                            <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                        </Col>
                        <Col>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Add Biography"
                                value={form.biography}
                                onChange={e => handleChange('biography', e.target.value)}
                            />
                        </Col>
                    </Row>

                    {/* BASIC INFO */}
                    <p className="text-primary fw-semibold mb-2" style={{ fontSize: 12, letterSpacing: 1 }}>BASIC INFO</p>
                    <hr className="mt-0 mb-3" />
                    <Row className="g-3 mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control placeholder="First name" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} isInvalid={!!errors.firstName} />
                                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Middle Name</Form.Label>
                                <Form.Control placeholder="Middle name" value={form.middleName} onChange={e => handleChange('middleName', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control placeholder="Last name" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Email ID <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="email" placeholder="email@example.com" value={form.email} onChange={e => handleChange('email', e.target.value)} isInvalid={!!errors.email} />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control placeholder="+1 234 567 8900" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>City</Form.Label>
                                <Form.Control placeholder="Enter city" value={form.city} onChange={e => handleChange('city', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>State</Form.Label>
                                <Form.Control placeholder="Enter state" value={form.state} onChange={e => handleChange('state', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Country</Form.Label>
                                <Form.Control placeholder="Enter country" value={form.country} onChange={e => handleChange('country', e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* COMPANY INFO */}
                    <p className="text-primary fw-semibold mb-2" style={{ fontSize: 12, letterSpacing: 1 }}>COMPANY INFO</p>
                    <hr className="mt-0 mb-3" />
                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Company Name</Form.Label>
                                <Form.Control placeholder="Company name" value={form.company} onChange={e => handleChange('company', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Designation</Form.Label>
                                <Form.Control placeholder="e.g. Sales Manager" value={form.designation} onChange={e => handleChange('designation', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Website</Form.Label>
                                <Form.Control placeholder="https://example.com" value={form.website} onChange={e => handleChange('website', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Work Phone</Form.Label>
                                <Form.Control placeholder="+1 234 567 8900" value={form.workPhone} onChange={e => handleChange('workPhone', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Department</Form.Label>
                                <Form.Control placeholder="Department" value={form.department} onChange={e => handleChange('department', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* ADDITIONAL INFO */}
                    <p className="text-primary fw-semibold mb-2" style={{ fontSize: 12, letterSpacing: 1 }}>ADDITIONAL INFO</p>
                    <hr className="mt-0 mb-3" />
                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Contact Source</Form.Label>
                                <Form.Select value={form.contactSource} onChange={e => handleChange('contactSource', e.target.value)}>
                                    <option value="">— Select source —</option>
                                    <option value="Direct">Direct</option>
                                    <option value="Organic Search">Organic Search</option>
                                    <option value="Referral">Referral</option>
                                </Form.Select>
                                <Form.Text className="text-muted">How did this contact find you?</Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Tags <span className="text-muted fw-normal" style={{ fontSize: 12 }}>(type and press comma to add, max 4)</span></Form.Label>
                                <TagInput
                                    value={form.labels}
                                    onChange={(val) => handleChange('labels', val)}
                                    placeholder="Add tags..."
                                    max={4}
                                />
                                <Form.Text className="text-muted">You can add up to 4 tags per contact</Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control placeholder="Facebook" value={form.facebook} onChange={e => handleChange('facebook', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control placeholder="Twitter" value={form.twitter} onChange={e => handleChange('twitter', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control placeholder="LinkedIn" value={form.linkedin} onChange={e => handleChange('linkedin', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control placeholder="Gmail" value={form.gmail} onChange={e => handleChange('gmail', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <div className="d-flex flex-wrap gap-3 pt-1">
                                <Form.Check type="switch" id="contact-important" label="Mark as important" checked={form.favorite} onChange={e => handleChange('favorite', e.target.checked)} />
                                <Form.Check type="switch" id="contact-archived" label="Archive contact" checked={form.archived} onChange={e => handleChange('archived', e.target.checked)} />
                                <Form.Check type="switch" id="contact-pending" label="Pending review" checked={form.pending} onChange={e => handleChange('pending', e.target.checked)} />
                                <Form.Check type="switch" id="contact-deleted" label="Deleted" checked={form.deleted} onChange={e => handleChange('deleted', e.target.checked)} />
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Discard</Button>
                    <Button variant="primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Create Contact'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ contacts }) => ({ contacts });
export default connect(mapStateToProps, { addContact, updateContact, deleteContact, addCustomer })(ContactAppBody);
