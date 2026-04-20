import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
    Button, Card, Col, Container, Form, Modal, Row, Badge, Table
} from 'react-bootstrap';
import { addCustomer, updateCustomer, deleteCustomer } from '../../redux/action/Crm';

const STATUS_OPTIONS = ['Active', 'Inactive', 'Prospect', 'VIP'];
const STATUS_COLORS = { Active: 'success', Inactive: 'secondary', Prospect: 'info', VIP: 'warning' };

const emptyForm = { name: '', email: '', phone: '', company: '', status: 'Active', address: '', notes: '' };

const Customers = ({ customers, addCustomer, updateCustomer, deleteCustomer }) => {
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState({});

    const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ ...c }); setErrors({}); setShowModal(true); };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Required';
        if (!form.email.trim()) e.email = 'Required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        if (editing) {
            updateCustomer({ ...editing, ...form });
        } else {
            addCustomer({ ...form, createdAt: new Date().toLocaleDateString() });
        }
        setShowModal(false);
    };

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    useEffect(() => {
        if (location.state?.openAdd) openAdd();
        if (location.state?.selectedCustomerId) {
            const selected = customers.find((item) => item.id === location.state.selectedCustomerId);
            if (selected) {
                setSearch(selected.name || '');
                openEdit(selected);
            }
        }
    }, []);

    const filtered = useMemo(() => customers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase())
    ), [customers, search]);

    const activeCount = customers.filter(c => c.status === 'Active').length;
    const vipCount = customers.filter(c => c.status === 'VIP').length;

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="pg-title mb-1">Customers</h1>
                    <p className="text-muted mb-0">Manage your customer relationships</p>
                </div>
                <Button variant="primary" onClick={openAdd}>
                    <i className="ri-add-line me-1" /> Add Customer
                </Button>
            </div>

            {/* Stats */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 fs-7">Total Customers</p>
                            <h4 className="mb-0">{customers.length}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 fs-7">Active</p>
                            <h4 className="mb-0 text-success">{activeCount}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 fs-7">VIP Customers</p>
                            <h4 className="mb-0 text-warning">{vipCount}</h4>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                    <h6 className="mb-0">All Customers ({filtered.length})</h6>
                    <Form.Control
                        size="sm"
                        type="search"
                        placeholder="Search..."
                        className="w-200p"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </Card.Header>
                <Card.Body className="p-0">
                    {filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="ri-user-3-line fs-1 d-block mb-2" />
                            No customers yet. Click "Add Customer" to get started.
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Company</th>
                                    <th>Status</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="avatar avatar-xs rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                    style={{ background: '#4f46e5', width: 32, height: 32, minWidth: 32, fontSize: 13 }}
                                                >
                                                    {c.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="fw-medium">{c.name}</span>
                                            </div>
                                        </td>
                                        <td>{c.email}</td>
                                        <td>{c.phone || '-'}</td>
                                        <td>{c.company || '-'}</td>
                                        <td>
                                            <Badge bg={STATUS_COLORS[c.status] || 'secondary'} className="fw-normal">
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td>{c.createdAt || '-'}</td>
                                        <td>
                                            <Button size="sm" variant="soft-primary" className="me-1 btn-icon btn-rounded" onClick={() => openEdit(c)}>
                                                <i className="ri-edit-line" />
                                            </Button>
                                            <Button size="sm" variant="soft-danger" className="btn-icon btn-rounded" onClick={() => deleteCustomer(c.id)}>
                                                <i className="ri-delete-bin-line" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editing ? 'Edit Customer' : 'New Customer'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    placeholder="Customer name"
                                    value={form.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    isInvalid={!!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="email@company.com"
                                    value={form.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    placeholder="+1 234 567 8900"
                                    value={form.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Company</Form.Label>
                                <Form.Control
                                    placeholder="Company name"
                                    value={form.company}
                                    onChange={e => handleChange('company', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    placeholder="Street, City, Country"
                                    value={form.address}
                                    onChange={e => handleChange('address', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Additional notes..."
                                    value={form.notes}
                                    onChange={e => handleChange('notes', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editing ? 'Save Changes' : 'Add Customer'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

const mapStateToProps = ({ customers }) => ({ customers });
export default connect(mapStateToProps, { addCustomer, updateCustomer, deleteCustomer })(Customers);
