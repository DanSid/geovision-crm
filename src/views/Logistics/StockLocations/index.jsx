import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Form, Modal, Row, Badge, Table } from 'react-bootstrap';
import { MapPin, Plus, Edit2, Trash2, Search } from 'react-feather';
import {
    addStockLocation,
    updateStockLocation,
    deleteStockLocation,
} from '../../../redux/action/Crm';

const TYPE_OPTIONS = ['Warehouse', 'Store', 'Workshop'];
const ACTIVE_OPTIONS = ['Yes', 'No'];
const ACTIVE_COLORS = { Yes: 'success', No: 'secondary' };

const emptyForm = {
    name: '',
    color: '#000000',
    type: 'Warehouse',
    active: 'Yes',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    country: 'Ghana',
};

const StockLocationsPage = ({
    stockLocations,
    addStockLocation,
    updateStockLocation,
    deleteStockLocation,
}) => {
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

    const openEdit = (item) => {
        setEditing(item);
        setForm({ ...emptyForm, ...item });
        setErrors({});
        setShowModal(true);
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        if (editing) {
            updateStockLocation({ ...editing, ...form });
        } else {
            addStockLocation({ ...form });
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this stock location?')) {
            deleteStockLocation(id);
        }
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const filtered = useMemo(
        () =>
            (stockLocations || []).filter((item) => {
                const q = search.toLowerCase();
                return [item.name, item.type, item.city, item.country]
                    .filter(Boolean)
                    .some((v) => `${v}`.toLowerCase().includes(q));
            }),
        [stockLocations, search],
    );

    return (
        <div className="hk-pg-body px-0">
            <div className="px-4 pt-4 pb-3">
                {/* Page header */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h1 className="pg-title mb-0">Stock Locations</h1>
                    <Button variant="primary" size="sm" onClick={openAdd}>
                        <Plus size={16} className="me-1" />
                        Add Stock Location
                    </Button>
                </div>

                {/* Search */}
                <div className="d-flex align-items-center mb-3">
                    <div className="position-relative w-100" style={{ maxWidth: 360 }}>
                        <Search size={14} className="position-absolute text-muted" style={{ top: 10, left: 10 }} />
                        <Form.Control
                            size="sm"
                            type="search"
                            placeholder="Search locations..."
                            className="ps-4"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table card */}
                <Card className="card-border">
                    <Card.Body className="p-0">
                        {filtered.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <MapPin size={48} className="d-block mx-auto mb-2 opacity-50" />
                                <p className="mb-2">No stock locations added yet</p>
                                <Button variant="outline-primary" size="sm" onClick={openAdd}>
                                    <Plus size={14} className="me-1" />
                                    Add Stock Location
                                </Button>
                            </div>
                        ) : (
                            <Table hover responsive className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="fs-7">Name</th>
                                        <th className="fs-7">Type</th>
                                        <th className="fs-7">City</th>
                                        <th className="fs-7">Country</th>
                                        <th className="fs-7">Active</th>
                                        <th className="fs-7">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span
                                                        className="d-inline-block rounded-circle"
                                                        style={{
                                                            width: 12,
                                                            height: 12,
                                                            minWidth: 12,
                                                            backgroundColor: item.color || '#000000',
                                                        }}
                                                    />
                                                    <span className="fw-medium">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="fs-7">{item.type || 'Warehouse'}</td>
                                            <td className="fs-7">{item.city || '-'}</td>
                                            <td className="fs-7">{item.country || '-'}</td>
                                            <td>
                                                <Badge
                                                    bg={ACTIVE_COLORS[item.active] || 'secondary'}
                                                    className="fw-normal"
                                                >
                                                    {item.active || 'Yes'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="soft-primary"
                                                    className="me-1 btn-icon btn-rounded"
                                                    title="Edit location"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="soft-danger"
                                                    className="btn-icon btn-rounded"
                                                    title="Delete location"
                                                    onClick={() => handleDelete(item.id)}
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
            </div>

            {/* Add / Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editing ? 'Edit Stock Location' : 'Create Stock Location'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        {/* Row 1: Name (full width) */}
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>
                                    Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    placeholder="Location name"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    isInvalid={!!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Row 2: Color | Type | Active */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Color</Form.Label>
                                <Form.Control
                                    type="color"
                                    value={form.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    title="Choose a color"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Form.Select
                                    value={form.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                >
                                    {TYPE_OPTIONS.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Active</Form.Label>
                                <Form.Select
                                    value={form.active}
                                    onChange={(e) => handleChange('active', e.target.value)}
                                >
                                    {ACTIVE_OPTIONS.map((a) => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Row 3: Street | House Number */}
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label>Street</Form.Label>
                                <Form.Control
                                    placeholder="Street name"
                                    value={form.street}
                                    onChange={(e) => handleChange('street', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>House Number</Form.Label>
                                <Form.Control
                                    placeholder="No."
                                    value={form.houseNumber}
                                    onChange={(e) => handleChange('houseNumber', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Row 4: Postal Code | City */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Postal Code</Form.Label>
                                <Form.Control
                                    placeholder="00000"
                                    value={form.postalCode}
                                    onChange={(e) => handleChange('postalCode', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                    placeholder="City"
                                    value={form.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Row 5: Country */}
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Country</Form.Label>
                                <Form.Control
                                    placeholder="Country"
                                    value={form.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editing ? 'Save Changes' : 'Create Stock Location'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ stockLocations }) => ({ stockLocations });
export default connect(mapStateToProps, { addStockLocation, updateStockLocation, deleteStockLocation })(StockLocationsPage);
