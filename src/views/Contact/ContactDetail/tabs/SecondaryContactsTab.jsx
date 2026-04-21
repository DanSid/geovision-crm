import React, { useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { Plus, Trash2 } from 'react-feather';
import { connect } from 'react-redux';
import { addSecondaryContact, deleteSecondaryContact } from '../../../../redux/action/Crm';

const emptyForm = {
    name: '', company: '', title: '', phone: '', mobile: '', fax: '',
    email: '', website: '', idStatus: '', isPrivate: false,
};

const SecondaryContactsTab = ({ contactId, secondaryContacts, addSecondaryContact, deleteSecondaryContact }) => {
    const [show, setShow] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const myContacts = secondaryContacts
        .filter(sc => String(sc.contactId) === String(contactId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Contact name is required';
        return e;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        addSecondaryContact({ ...form, contactId });
        setForm(emptyForm);
        setErrors({});
        setShow(false);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">
                    {myContacts.length} secondary contact{myContacts.length !== 1 ? 's' : ''}
                </h6>
                <Button size="sm" variant="primary" onClick={() => setShow(true)}>
                    <Plus size={14} className="me-1" />New Secondary Contact
                </Button>
            </div>

            {myContacts.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="mb-2">No secondary contacts yet.</p>
                    <Button size="sm" variant="outline-primary" onClick={() => setShow(true)}>Add secondary contact</Button>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Contact</th>
                                <th>Company</th>
                                <th>Title</th>
                                <th>Phone</th>
                                <th>E-mail</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {myContacts.map(sc => (
                                <tr key={sc.id}>
                                    <td className="fw-medium fs-7">{sc.name}</td>
                                    <td className="fs-7">{sc.company || '—'}</td>
                                    <td className="fs-7">{sc.title || '—'}</td>
                                    <td className="fs-7">{sc.phone || sc.mobile || '—'}</td>
                                    <td className="fs-7">{sc.email || '—'}</td>
                                    <td>
                                        <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded p-1"
                                            title="Remove secondary contact"
                                            onClick={() => deleteSecondaryContact(sc.id)}>
                                            <Trash2 size={13} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* New Secondary Contact Modal */}
            <Modal show={show} onHide={() => { setShow(false); setForm(emptyForm); setErrors({}); }}>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">New Secondary Contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Contact Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control size="sm" value={form.name} onChange={e => set('name', e.target.value)}
                                isInvalid={!!errors.name} placeholder="Full name" />
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Company</Form.Label>
                            <Form.Control size="sm" value={form.company} onChange={e => set('company', e.target.value)}
                                placeholder="Company name" />
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Title</Form.Label>
                            <Form.Select size="sm" value={form.title} onChange={e => set('title', e.target.value)}>
                                <option value="">— Select —</option>
                                {['Mr.','Ms.','Mrs.','Dr.','Prof.'].map(t => <option key={t}>{t}</option>)}
                            </Form.Select>
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">ID/Status</Form.Label>
                            <Form.Control size="sm" value={form.idStatus} onChange={e => set('idStatus', e.target.value)}
                                placeholder="Status" />
                        </div>
                    </div>

                    <h6 className="mt-3 mb-2 fs-7 text-muted text-uppercase">Phone/E-mail</h6>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Phone</Form.Label>
                            <Form.Control size="sm" value={form.phone} onChange={e => set('phone', e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Mobile</Form.Label>
                            <Form.Control size="sm" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Fax</Form.Label>
                            <Form.Control size="sm" value={form.fax} onChange={e => set('fax', e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">E-mail</Form.Label>
                            <Form.Control size="sm" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>
                        <div className="col-12">
                            <Form.Label className="fs-7">Web Site</Form.Label>
                            <Form.Control size="sm" value={form.website} onChange={e => set('website', e.target.value)}
                                placeholder="https://" />
                        </div>
                    </div>

                    <div className="mt-3">
                        <Form.Check
                            id="sc-private"
                            label="Make Private"
                            checked={form.isPrivate}
                            onChange={e => set('isPrivate', e.target.checked)}
                            className="fs-7"
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => { setShow(false); setForm(emptyForm); setErrors({}); }}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ secondaryContacts }) => ({ secondaryContacts });
export default connect(mapStateToProps, { addSecondaryContact, deleteSecondaryContact })(SecondaryContactsTab);
