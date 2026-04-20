import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Button, Card, Col, Form, Modal, Row, Badge, Table
} from 'react-bootstrap';
import { Truck, Edit2, Trash2, Plus, Search } from 'react-feather';
import { addVehicle, updateVehicle, deleteVehicle } from '../../../redux/action/Crm';

const CURRENCY_OPTIONS = [
    { value: 'GHS', label: 'Ghana Cedi (GHS)', symbol: '\u20B5' },
    { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
];

const AVAILABILITY_OPTIONS = ['Once at a time', 'Multiple bookings'];
const DISPLAY_OPTIONS = ['Yes', 'No'];
const FOLDER_OPTIONS = ['Vehicles'];

const emptyForm = {
    registrationNumber: '',
    name: '',
    costPerKm: 0,
    fixedRate: 0,
    currency: 'GHS',
    inspectionDate: '',
    seats: 2,
    loadCapacity: 0,
    surfaceArea: '',
    width: 0,
    length: 0,
    height: 0,
    folder: 'Vehicles',
    availability: 'Once at a time',
    displayInPlanner: 'Yes',
    description: '',
};

const currencySymbol = (cur) => (cur === 'GHS' ? '\u20B5' : '$');

const VehiclesPage = ({ vehicles, addVehicle, updateVehicle, deleteVehicle }) => {
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

    const openEdit = (vehicle) => {
        setEditing(vehicle);
        setForm({
            ...emptyForm,
            ...vehicle,
            inspectionDate: vehicle.inspectionDate ? vehicle.inspectionDate.slice(0, 10) : '',
        });
        setErrors({});
        setShowModal(true);
    };

    const validate = () => {
        const e = {};
        if (!form.registrationNumber.trim()) e.registrationNumber = 'Required';
        if (!form.name.trim()) e.name = 'Required';
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        const payload = {
            ...form,
            costPerKm: Number(form.costPerKm) || 0,
            fixedRate: Number(form.fixedRate) || 0,
            seats: Number(form.seats) || 0,
            loadCapacity: Number(form.loadCapacity) || 0,
            width: Number(form.width) || 0,
            length: Number(form.length) || 0,
            height: Number(form.height) || 0,
        };
        if (editing) {
            updateVehicle({ ...editing, ...payload });
        } else {
            addVehicle({ ...payload });
        }
        setShowModal(false);
    };

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    const handleDelete = (vehicle) => {
        if (window.confirm(`Delete vehicle "${vehicle.registrationNumber} - ${vehicle.name}"? This action cannot be undone.`)) {
            deleteVehicle(vehicle.id);
        }
    };

    const filtered = useMemo(() => (vehicles || []).filter(v => {
        const q = search.toLowerCase();
        return [v.registrationNumber, v.name, v.folder, v.availability]
            .filter(Boolean)
            .some(val => `${val}`.toLowerCase().includes(q));
    }), [vehicles, search]);

    const sym = (v) => currencySymbol(v.currency || 'GHS');

    return (
        <div className="hk-pg-body px-4 py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="pg-title mb-0">Vehicles</h1>
                </div>
                <Button variant="primary" onClick={openAdd}>
                    <Plus size={16} className="me-1" /> Add Vehicle
                </Button>
            </div>

            {/* Search */}
            <div className="mb-3">
                <div className="position-relative">
                    <Form.Control
                        type="search"
                        placeholder="Search vehicles..."
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
                            <Truck size={48} className="d-block mx-auto mb-2 opacity-50" />
                            <p className="mb-0">No vehicles found. Click "+ Add Vehicle" to get started.</p>
                        </div>
                    ) : (
                        <Table hover responsive className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Reg. Number</th>
                                    <th>Name</th>
                                    <th>Seats</th>
                                    <th>Load (kg)</th>
                                    <th>Cost/km</th>
                                    <th>Fixed Rate</th>
                                    <th>Inspection</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(v => (
                                    <tr key={v.id}>
                                        <td className="fw-medium">{v.registrationNumber}</td>
                                        <td>{v.name}</td>
                                        <td>{v.seats}</td>
                                        <td>
                                            <span className="fs-7">{v.loadCapacity} kg</span>
                                        </td>
                                        <td>
                                            {sym(v)}{Number(v.costPerKm || 0).toFixed(2)}
                                        </td>
                                        <td>
                                            {sym(v)}{Number(v.fixedRate || 0).toFixed(2)}
                                        </td>
                                        <td>
                                            {v.inspectionDate
                                                ? new Date(v.inspectionDate).toLocaleDateString()
                                                : <span className="text-muted fs-7">-</span>
                                            }
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="soft-primary"
                                                className="me-1 btn-icon btn-rounded"
                                                onClick={() => openEdit(v)}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="soft-danger"
                                                className="btn-icon btn-rounded"
                                                onClick={() => handleDelete(v)}
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

            {/* Create / Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editing ? 'Edit Vehicle' : 'Create Vehicle'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Section: Vehicle */}
                    <h6 className="text-uppercase text-muted fs-7 mb-3">Vehicle</h6>
                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Registration Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    placeholder="e.g. GR-1234-21"
                                    value={form.registrationNumber}
                                    onChange={e => handleChange('registrationNumber', e.target.value)}
                                    isInvalid={!!errors.registrationNumber}
                                />
                                <Form.Control.Feedback type="invalid">{errors.registrationNumber}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    placeholder="Vehicle name"
                                    value={form.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    isInvalid={!!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Section: Financial */}
                    <h6 className="text-uppercase text-muted fs-7 mb-3">Financial</h6>
                    <Row className="g-3 mb-4">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Currency</Form.Label>
                                <Form.Select
                                    value={form.currency}
                                    onChange={e => handleChange('currency', e.target.value)}
                                >
                                    {CURRENCY_OPTIONS.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Cost per km ({currencySymbol(form.currency)})</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.costPerKm}
                                    onChange={e => handleChange('costPerKm', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fixed rate ({currencySymbol(form.currency)})</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.fixedRate}
                                    onChange={e => handleChange('fixedRate', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Section: Details */}
                    <h6 className="text-uppercase text-muted fs-7 mb-3">Details</h6>
                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Inspection Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={form.inspectionDate}
                                    onChange={e => handleChange('inspectionDate', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Seats</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.seats}
                                    onChange={e => handleChange('seats', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Load Capacity (kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.loadCapacity}
                                    onChange={e => handleChange('loadCapacity', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Surface Area</Form.Label>
                                <Form.Control
                                    placeholder="e.g. 12 m²"
                                    value={form.surfaceArea}
                                    onChange={e => handleChange('surfaceArea', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Width (cm)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.width}
                                    onChange={e => handleChange('width', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Length (cm)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.length}
                                    onChange={e => handleChange('length', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Height (cm)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.height}
                                    onChange={e => handleChange('height', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Section: Settings */}
                    <h6 className="text-uppercase text-muted fs-7 mb-3">Settings</h6>
                    <Row className="g-3 mb-4">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Folder</Form.Label>
                                <Form.Select
                                    value={form.folder}
                                    onChange={e => handleChange('folder', e.target.value)}
                                >
                                    {FOLDER_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Availability</Form.Label>
                                <Form.Select
                                    value={form.availability}
                                    onChange={e => handleChange('availability', e.target.value)}
                                >
                                    {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Display in Planner</Form.Label>
                                <Form.Select
                                    value={form.displayInPlanner}
                                    onChange={e => handleChange('displayInPlanner', e.target.value)}
                                >
                                    {DISPLAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Description */}
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Vehicle description..."
                                    value={form.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editing ? 'Save Changes' : 'Create Vehicle'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ vehicles }) => ({ vehicles });
export default connect(mapStateToProps, { addVehicle, updateVehicle, deleteVehicle })(VehiclesPage);
