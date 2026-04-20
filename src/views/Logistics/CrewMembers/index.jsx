import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Button, Card, Col, Form, Modal, Row, Badge, Table
} from 'react-bootstrap';
import { Users, Edit2, Trash2, Plus, Search } from 'react-feather';
import { addCrewMember, updateCrewMember, deleteCrewMember } from '../../../redux/action/Crm';

const USER_ROLES = ['Worker', 'Vendor', 'External Worker', 'Admin'];
// const FOLDER_OPTIONS = ['1. Own Crew', '2. Freelancers', '3. External'];

const ROLE_COLORS = {
    'Worker': 'secondary',
    'Vendor': 'info',
    'External Worker': 'primary',
    'Admin': 'danger',
};

const emptyForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userRole: 'Default user role',
    // folder: '1. Own Crew',
};

const CrewMembersPage = ({ crewMembers, addCrewMember, updateCrewMember, deleteCrewMember }) => {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState({});

    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (member) => {
        setEditing(member);
        setForm({ ...emptyForm, ...member });
        setErrors({});
        setShowModal(true);
    };

    const validate = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim()) e.lastName = 'Required';
        if (!form.email.trim()) e.email = 'Required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        if (editing) {
            updateCrewMember({ ...editing, ...form });
        } else {
            addCrewMember({ ...form });
        }
        setShowModal(false);
    };

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    const handleDelete = (member) => {
        if (window.confirm(`Delete crew member "${member.firstName} ${member.lastName}"? This action cannot be undone.`)) {
            deleteCrewMember(member.id);
        }
    };

    const filtered = useMemo(() => (crewMembers || []).filter(m => {
        const q = search.toLowerCase();
        return [m.firstName, m.lastName, m.email, m.phone, m.userRole]
            .filter(Boolean)
            .some(v => `${v}`.toLowerCase().includes(q));
    }), [crewMembers, search]);

    return (
        <div className="hk-pg-body px-4 py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="pg-title mb-0">Crew Members</h1>
                </div>
                <Button variant="primary" onClick={openAdd}>
                    <Plus size={16} className="me-1" /> Add Crew Member
                </Button>
            </div>

            {/* Search */}
            <div className="mb-3">
                <div className="position-relative">
                    <Form.Control
                        type="search"
                        placeholder="Search crew members..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="ps-5"
                    />
                    <Search size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14 }} />
                </div>
            </div>

            {/* Table */}
            <Card className="card-border">
                <Card.Body className="p-0">
                    {filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Users size={48} className="d-block mx-auto mb-2 opacity-50" />
                            <p className="mb-0">No crew members found. Click "+ Add Crew Member" to get started.</p>
                        </div>
                    ) : (
                        <Table hover responsive className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>First and Last Name</th>
                                    {/* <th>Folder</th> */}
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>User Role</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(m => (
                                    <tr key={m.id}>
                                        <td className="fw-medium">
                                            {m.firstName} {m.lastName}
                                        </td>
                                        <td>
                                            {/* <span className="fs-7 text-muted">{m.folder || '-'}</span> */}
                                        </td>
                                        <td>{m.email}</td>
                                        <td>{m.phone || '-'}</td>
                                        <td>
                                            <Badge bg={ROLE_COLORS[m.userRole] || 'secondary'} className="fw-normal">
                                                {m.userRole}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="soft-primary"
                                                className="me-1 btn-icon btn-rounded"
                                                onClick={() => openEdit(m)}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="soft-danger"
                                                className="btn-icon btn-rounded"
                                                onClick={() => handleDelete(m)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Add / Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editing ? 'Edit Crew Member' : 'Add Crew Member'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        {/* Row 1: First name | Last name */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    placeholder="First name"
                                    value={form.firstName}
                                    onChange={e => handleChange('firstName', e.target.value)}
                                    isInvalid={!!errors.firstName}
                                />
                                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    placeholder="Last name"
                                    value={form.lastName}
                                    onChange={e => handleChange('lastName', e.target.value)}
                                    isInvalid={!!errors.lastName}
                                />
                                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Row 2: User role | Email */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>User Role</Form.Label>
                                <Form.Select
                                    value={form.userRole}
                                    onChange={e => handleChange('userRole', e.target.value)}
                                >
                                    {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="email@example.com"
                                    value={form.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Row 3: Phone (full width) */}
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    placeholder="+233 XX XXX XXXX"
                                    value={form.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Row 4: Folder (dropdown) */}
                        {/* <Col md={12}>
                            <Form.Group>
                                <Form.Label>Folder</Form.Label>
                                <Form.Select
                                    value={form.folder}
                                    onChange={e => handleChange('folder', e.target.value)}
                                >
                                    {FOLDER_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editing ? 'Save Changes' : 'Add Crew Member'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ crewMembers }) => ({ crewMembers });
export default connect(mapStateToProps, { addCrewMember, updateCrewMember, deleteCrewMember })(CrewMembersPage);
