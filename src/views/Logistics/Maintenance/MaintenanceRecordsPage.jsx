import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { Edit2, Plus, Search, Trash2 } from 'react-feather';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
const STATUS_COLORS = { Pending: 'warning', 'In Progress': 'info', Completed: 'success' };
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const PRIORITY_COLORS = { Low: 'secondary', Medium: 'info', High: 'warning', Urgent: 'danger' };
const CURRENCY_OPTIONS = [
    { value: 'GHS', label: 'GHS (\u20b5)' },
    { value: 'USD', label: 'USD ($)' },
];

const defaultEmptyForm = {
    title: '',
    equipmentId: '',
    equipmentName: '',
    assignedTo: '',
    date: '',
    status: 'Pending',
    priority: 'Medium',
    notes: '',
    cost: 0,
    currency: 'GHS',
};

const getCurrencySymbol = (currency) => (currency === 'USD' ? '$' : '\u20b5');

const MaintenanceRecordsPage = ({
    title,
    subtitle,
    actionLabel,
    searchPlaceholder,
    emptyMessage,
    modalTitleCreate,
    modalTitleEdit,
    titleLabel = 'Title',
    titlePlaceholder = 'Record title',
    assignedToLabel = 'Assigned To',
    assignedToPlaceholder = 'Person responsible',
    dateLabel = 'Date',
    emptyIcon: EmptyIcon,
    recordType,
    maintenance,
    equipment,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(defaultEmptyForm);
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState({});

    const records = useMemo(
        () => (maintenance || []).filter((record) => record.type === recordType),
        [maintenance, recordType]
    );

    const filtered = useMemo(
        () =>
            records.filter((record) => {
                const query = search.toLowerCase();
                return (
                    (record.title || '').toLowerCase().includes(query) ||
                    (record.equipmentName || '').toLowerCase().includes(query) ||
                    (record.assignedTo || '').toLowerCase().includes(query)
                );
            }),
        [records, search]
    );

    const openAdd = () => {
        setEditing(null);
        setForm(defaultEmptyForm);
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        setForm({
            title: record.title || '',
            equipmentId: record.equipmentId || '',
            equipmentName: record.equipmentName || '',
            assignedTo: record.assignedTo || '',
            date: record.date ? record.date.slice(0, 10) : '',
            status: record.status || 'Pending',
            priority: record.priority || 'Medium',
            notes: record.notes || '',
            cost: record.cost ?? 0,
            currency: record.currency || 'GHS',
        });
        setErrors({});
        setShowModal(true);
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.title.trim()) nextErrors.title = 'Required';
        return nextErrors;
    };

    const handleSave = () => {
        const nextErrors = validate();
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        const payload = {
            ...form,
            type: recordType,
            cost: Number(form.cost) || 0,
        };

        if (editing) {
            updateMaintenance({ ...editing, ...payload });
        } else {
            addMaintenance(payload);
        }
        setShowModal(false);
    };

    const handleChange = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        if (errors[field]) {
            setErrors((current) => {
                const nextErrors = { ...current };
                delete nextErrors[field];
                return nextErrors;
            });
        }
    };

    const handleEquipmentChange = (equipmentId) => {
        const equipmentItem = (equipment || []).find((item) => String(item.id) === String(equipmentId));
        setForm((current) => ({
            ...current,
            equipmentId,
            equipmentName: equipmentItem ? equipmentItem.name : '',
        }));
    };

    const handleDelete = (record) => {
        if (window.confirm(`Are you sure you want to delete "${record.title}"?`)) {
            deleteMaintenance(record.id);
        }
    };

    return (
        <div className="hk-pg-body">
            <Container fluid className="py-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h1 className="pg-title mb-1">{title}</h1>
                        <p className="text-muted mb-0 fs-7">{subtitle}</p>
                    </div>
                    <Button variant="primary" onClick={openAdd}>
                        <Plus size={16} className="me-1" />
                        {actionLabel}
                    </Button>
                </div>

                <Row className="mb-3">
                    <Col md={4}>
                        <div className="position-relative">
                            <Search size={14} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                            <Form.Control
                                size="sm"
                                type="search"
                                placeholder={searchPlaceholder}
                                className="ps-4"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                    </Col>
                </Row>

                <Card className="card-border">
                    <Card.Body className="p-0">
                        {filtered.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <EmptyIcon size={48} className="d-block mx-auto mb-2 opacity-50" />
                                <p className="mb-0">{emptyMessage}</p>
                            </div>
                        ) : (
                            <Table hover responsive className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="fs-7">Title</th>
                                        <th className="fs-7">Equipment</th>
                                        <th className="fs-7">{assignedToLabel}</th>
                                        <th className="fs-7">{dateLabel}</th>
                                        <th className="fs-7">Status</th>
                                        <th className="fs-7">Priority</th>
                                        <th className="fs-7">Cost</th>
                                        <th className="fs-7">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((record) => (
                                        <tr key={record.id}>
                                            <td className="fs-7 fw-medium">{record.title}</td>
                                            <td className="fs-7">{record.equipmentName || '-'}</td>
                                            <td className="fs-7">{record.assignedTo || '-'}</td>
                                            <td className="fs-7">{record.date || '-'}</td>
                                            <td>
                                                <Badge bg={STATUS_COLORS[record.status] || 'secondary'} className="fw-normal fs-7">
                                                    {record.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={PRIORITY_COLORS[record.priority] || 'secondary'} className="fw-normal fs-7">
                                                    {record.priority}
                                                </Badge>
                                            </td>
                                            <td className="fs-7">
                                                {getCurrencySymbol(record.currency)}{Number(record.cost || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="soft-primary"
                                                    className="me-1 btn-icon btn-rounded"
                                                    onClick={() => openEdit(record)}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="soft-danger"
                                                    className="btn-icon btn-rounded"
                                                    onClick={() => handleDelete(record)}
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

                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{editing ? modalTitleEdit : modalTitleCreate}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>
                                        {titleLabel} <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        placeholder={titlePlaceholder}
                                        value={form.title}
                                        onChange={(event) => handleChange('title', event.target.value)}
                                        isInvalid={!!errors.title}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Equipment</Form.Label>
                                    <Form.Select
                                        value={form.equipmentId}
                                        onChange={(event) => handleEquipmentChange(event.target.value)}
                                    >
                                        <option value="">-- Select Equipment --</option>
                                        {(equipment || []).map((equipmentItem) => (
                                            <option key={equipmentItem.id} value={equipmentItem.id}>
                                                {equipmentItem.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{assignedToLabel}</Form.Label>
                                    <Form.Control
                                        placeholder={assignedToPlaceholder}
                                        value={form.assignedTo}
                                        onChange={(event) => handleChange('assignedTo', event.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>{dateLabel}</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={form.date}
                                        onChange={(event) => handleChange('date', event.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={form.status}
                                        onChange={(event) => handleChange('status', event.target.value)}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Select
                                        value={form.priority}
                                        onChange={(event) => handleChange('priority', event.target.value)}
                                    >
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Currency</Form.Label>
                                    <Form.Select
                                        value={form.currency}
                                        onChange={(event) => handleChange('currency', event.target.value)}
                                    >
                                        {CURRENCY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Cost</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.cost}
                                        onChange={(event) => handleChange('cost', event.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add supporting notes"
                                        value={form.notes}
                                        onChange={(event) => handleChange('notes', event.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <div className="modal-footer">
                        <Button variant="light" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            {editing ? 'Save Changes' : actionLabel}
                        </Button>
                    </div>
                </Modal>
            </Container>
        </div>
    );
};

export default MaintenanceRecordsPage;
