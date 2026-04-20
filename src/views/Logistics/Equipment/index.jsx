import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Form, Modal, Row, Badge, Table } from 'react-bootstrap';
import { Package, Plus, Edit2, Trash2, Search } from 'react-feather';
import {
    addEquipment,
    updateEquipment,
    deleteEquipment,
} from '../../../redux/action/Crm';

const SALE_TYPES = ['Rental', 'Sale'];
const ITEM_TYPES = ['Physical', 'Virtual'];
const CURRENCIES = ['GHS', 'USD'];
const STATUS_OPTIONS = ['Active', 'Archived'];
const STATUS_COLORS = { Active: 'success', Archived: 'secondary' };

const emptyForm = {
    name: '',
    salePrice: 0,
    currency: 'GHS',
    quantity: 0,
    stockLocation: '',
    saleType: 'Rental',
    itemType: 'Physical',
    category: '',
    status: 'Active',
    serialNumber: '',
    description: '',
};

const currencySymbol = (code) => (code === 'GHS' ? '\u20B5' : '$');

const EquipmentPage = ({
    equipment,
    stockLocations,
    addEquipment,
    updateEquipment,
    deleteEquipment,
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
        const payload = {
            ...form,
            salePrice: Number(form.salePrice) || 0,
            quantity: Number(form.quantity) || 0,
        };
        if (editing) {
            updateEquipment({ ...editing, ...payload });
        } else {
            addEquipment(payload);
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            deleteEquipment(id);
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
            (equipment || []).filter((item) => {
                const q = search.toLowerCase();
                return [item.name, item.category, item.serialNumber, item.stockLocation, item.status]
                    .filter(Boolean)
                    .some((v) => `${v}`.toLowerCase().includes(q));
            }),
        [equipment, search],
    );

    const locationName = (locId) => {
        const loc = (stockLocations || []).find((s) => String(s.id) === String(locId));
        return loc ? loc.name : locId || '-';
    };

    return (
        <div className="hk-pg-body px-0">
            <div className="px-4 pt-4 pb-3">
                {/* Page header */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h1 className="pg-title mb-0">Equipment</h1>
                    <Button variant="primary" size="sm" onClick={openAdd}>
                        <Plus size={16} className="me-1" />
                        Add Equipment
                    </Button>
                </div>

                {/* Search */}
                <div className="d-flex align-items-center mb-3">
                    <div className="position-relative w-100" style={{ maxWidth: 360 }}>
                        <Search size={14} className="position-absolute text-muted" style={{ top: 10, left: 10 }} />
                        <Form.Control
                            size="sm"
                            type="search"
                            placeholder="Search equipment..."
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
                                <Package size={48} className="d-block mx-auto mb-2 opacity-50" />
                                <p className="mb-2">No equipment added yet</p>
                                <Button variant="outline-primary" size="sm" onClick={openAdd}>
                                    <Plus size={14} className="me-1" />
                                    Add Equipment
                                </Button>
                            </div>
                        ) : (
                            <Table hover responsive className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="fs-7">Name</th>
                                        <th className="fs-7">Category</th>
                                        <th className="fs-7">Sale Price</th>
                                        <th className="fs-7">Qty</th>
                                        <th className="fs-7">Stock Location</th>
                                        <th className="fs-7">Type</th>
                                        <th className="fs-7">Status</th>
                                        <th className="fs-7">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item) => (
                                        <tr key={item.id}>
                                            <td className="fw-medium">{item.name}</td>
                                            <td className="fs-7">{item.category || '-'}</td>
                                            <td className="fs-7">
                                                {currencySymbol(item.currency)}
                                                {Number(item.salePrice || 0).toLocaleString()}
                                            </td>
                                            <td className="fs-7">{item.quantity}</td>
                                            <td className="fs-7">{locationName(item.stockLocation)}</td>
                                            <td className="fs-7">
                                                <Badge bg="light" text="dark" className="fw-normal">
                                                    {item.saleType || 'Rental'} / {item.itemType || 'Physical'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={STATUS_COLORS[item.status] || 'secondary'} className="fw-normal">
                                                    {item.status || 'Active'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="soft-primary"
                                                    className="me-1 btn-icon btn-rounded"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="soft-danger"
                                                    className="btn-icon btn-rounded"
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
                    <Modal.Title>{editing ? 'Edit Equipment' : 'Create Equipment'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        {/* Name */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>
                                    Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    placeholder="Equipment name"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    isInvalid={!!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Category */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    placeholder="e.g. Lighting, Audio"
                                    value={form.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Sale Price */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Sale Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={form.salePrice}
                                    onChange={(e) => handleChange('salePrice', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Currency */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Currency</Form.Label>
                                <Form.Select
                                    value={form.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c === 'GHS' ? '\u20B5 GHS' : '$ USD'}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Quantity */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={form.quantity}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Stock Location */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Stock Location</Form.Label>
                                <Form.Select
                                    value={form.stockLocation}
                                    onChange={(e) => handleChange('stockLocation', e.target.value)}
                                >
                                    <option value="">-- Select location --</option>
                                    {(stockLocations || []).map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Serial Number */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Serial Number</Form.Label>
                                <Form.Control
                                    placeholder="SN-000"
                                    value={form.serialNumber}
                                    onChange={(e) => handleChange('serialNumber', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Sale Type toggle */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Sale Type</Form.Label>
                                <div className="d-flex gap-1">
                                    {SALE_TYPES.map((t) => (
                                        <Button
                                            key={t}
                                            size="sm"
                                            variant={form.saleType === t ? 'primary' : 'outline-secondary'}
                                            onClick={() => handleChange('saleType', t)}
                                            className="flex-fill"
                                        >
                                            {t}
                                        </Button>
                                    ))}
                                </div>
                            </Form.Group>
                        </Col>

                        {/* Item Type toggle */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Item Type</Form.Label>
                                <div className="d-flex gap-1">
                                    {ITEM_TYPES.map((t) => (
                                        <Button
                                            key={t}
                                            size="sm"
                                            variant={form.itemType === t ? 'primary' : 'outline-secondary'}
                                            onClick={() => handleChange('itemType', t)}
                                            className="flex-fill"
                                        >
                                            {t}
                                        </Button>
                                    ))}
                                </div>
                            </Form.Group>
                        </Col>

                        {/* Status */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={form.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Description */}
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Optional description..."
                                    value={form.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
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
                        {editing ? 'Save Changes' : 'Create Equipment'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ equipment, stockLocations }) => ({ equipment, stockLocations });
export default connect(mapStateToProps, { addEquipment, updateEquipment, deleteEquipment })(EquipmentPage);
