import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Col, Container, Form, Modal, Row, Badge, Table } from 'react-bootstrap';
import { addOpportunity, updateOpportunity, deleteOpportunity } from '../../redux/action/Crm';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const CURRENCIES = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'GHS', label: 'Ghana Cedi (₵)', symbol: '₵' },
];
const STAGE_COLORS = {
    Prospecting: 'info',
    Qualification: 'primary',
    Proposal: 'warning',
    Negotiation: 'orange',
    'Closed Won': 'success',
    'Closed Lost': 'danger',
};

const emptyForm = {
    name: '',
    company: '',
    dealValue: '',
    dealCurrency: 'USD',
    stage: 'Prospecting',
    startDate: '',
    expectedCloseDate: '',
    contactName: '',
    notes: '',
};

const currencyFormat = (value, symbol) => {
    const numeric = Number(value || 0);
    return `${symbol}${numeric.toLocaleString()}`;
};

const getDealAmount = (opportunity = {}) => Number(opportunity.dealValue ?? opportunity.value ?? opportunity.amount ?? 0) || 0;
const getDealCurrency = (opportunity = {}) => `${opportunity.dealCurrency || opportunity.currency || opportunity.valueCurrency || 'USD'}`.toUpperCase();

const normalizeOpportunity = (opportunity = {}) => ({
    ...opportunity,
    dealValue: opportunity.dealValue ?? opportunity.value ?? '',
    dealCurrency: getDealCurrency(opportunity),
    startDate: opportunity.startDate || opportunity.start || opportunity.createdAt || '',
    expectedCloseDate: opportunity.expectedCloseDate || opportunity.closeDate || '',
});

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

const Opportunities = ({ opportunities, addOpportunity, updateOpportunity, deleteOpportunity }) => {
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

    const openEdit = (opp) => {
        const normalized = normalizeOpportunity(opp);
        setEditing(normalized);
        setForm({
            ...emptyForm,
            ...normalized,
            dealCurrency: normalized.dealCurrency || 'USD',
            startDate: normalized.startDate ? normalized.startDate.slice(0, 10) : '',
            expectedCloseDate: normalized.expectedCloseDate ? normalized.expectedCloseDate.slice(0, 10) : '',
        });
        setErrors({});
        setShowModal(true);
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = 'Required';
        if (!form.company.trim()) nextErrors.company = 'Required';
        if (!form.stage) nextErrors.stage = 'Required';
        if (!form.dealValue && form.dealValue !== 0) nextErrors.dealValue = 'Required';
        if (!form.startDate) nextErrors.startDate = 'Required';
        if (!form.expectedCloseDate) nextErrors.expectedCloseDate = 'Required';
        return nextErrors;
    };

    const handleSave = () => {
        const nextErrors = validate();
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        const startDate = form.startDate ? new Date(`${form.startDate}T09:00:00`).toISOString() : '';
        const expectedCloseDate = form.expectedCloseDate ? new Date(`${form.expectedCloseDate}T17:00:00`).toISOString() : '';
        const payload = {
            ...form,
            startDate,
            start: startDate,
            end: expectedCloseDate,
            expectedCloseDate,
            value: form.dealValue,
            amount: form.dealValue,
            currency: form.dealCurrency,
            dealValue: form.dealValue,
            dealCurrency: form.dealCurrency,
            closeDate: form.expectedCloseDate,
        };

        if (editing) {
            updateOpportunity({ ...editing, ...payload });
        } else {
            addOpportunity({ ...payload, createdAt: new Date().toISOString() });
        }
        setShowModal(false);
    };

    const handleChange = (field, value) => {
        setForm(current => ({ ...current, [field]: value }));
        if (errors[field]) {
            setErrors(current => {
                const next = { ...current };
                delete next[field];
                return next;
            });
        }
    };

    const filtered = useMemo(() => opportunities
        .map(normalizeOpportunity)
        .filter(opportunity => {
            const query = search.toLowerCase();
            return [opportunity.name, opportunity.company, opportunity.contactName, opportunity.stage, opportunity.dealCurrency]
                .filter(Boolean)
                .some(value => `${value}`.toLowerCase().includes(query));
        }), [opportunities, search]);

    const totals = useMemo(() => filtered.reduce((acc, opportunity) => {
        const amount = getDealAmount(opportunity);
        const currency = getDealCurrency(opportunity);
        if (currency === 'GHS') acc.ghs += amount;
        else acc.usd += amount;
        return acc;
    }, { usd: 0, ghs: 0 }), [filtered]);

    const wonCount = filtered.filter(opportunity => opportunity.stage === 'Closed Won').length;
    const openCount = filtered.filter(opportunity => !['Closed Won', 'Closed Lost'].includes(opportunity.stage)).length;

    return (
        <Container fluid className="py-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="pg-title mb-1">Opportunities</h1>
                    <p className="text-muted mb-0">Track and manage your sales pipeline in dollars and cedis.</p>
                </div>
                <Button variant="primary" onClick={openAdd}>
                    <i className="ri-add-line me-1" /> Add Opportunity
                </Button>
            </div>

            <Row className="mb-4 g-3">
                <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1 fs-7">Pipeline Value (USD)</p><h4 className="mb-0">{currencyFormat(totals.usd, '$')}</h4></Card.Body></Card></Col>
                <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1 fs-7">Pipeline Value (GHS)</p><h4 className="mb-0">{currencyFormat(totals.ghs, '₵')}</h4></Card.Body></Card></Col>
                <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1 fs-7">Open Opportunities</p><h4 className="mb-0">{openCount}</h4></Card.Body></Card></Col>
                <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1 fs-7">Closed Won</p><h4 className="mb-0 text-success">{wonCount}</h4></Card.Body></Card></Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                    <h6 className="mb-0">All Opportunities ({filtered.length})</h6>
                    <Form.Control size="sm" type="search" placeholder="Search..." className="w-200p" value={search} onChange={e => setSearch(e.target.value)} />
                </Card.Header>
                <Card.Body className="p-0">
                    {filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted"><i className="ri-bar-chart-line fs-1 d-block mb-2" />No opportunities yet. Click "Add Opportunity" to get started.</div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Opportunity</th>
                                    <th>Company</th>
                                    <th>Contact</th>
                                    <th>Value</th>
                                    <th>Currency</th>
                                    <th>Stage</th>
                                    <th>Start Date</th>
                                    <th>Expected Close</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(opportunity => (
                                    <tr key={opportunity.id}>
                                        <td className="fw-medium">{opportunity.name}</td>
                                        <td>{opportunity.company}</td>
                                        <td>{opportunity.contactName || '-'}</td>
                                        <td>{currencyFormat(getDealAmount(opportunity), opportunity.dealCurrency === 'GHS' ? '₵' : '$')}</td>
                                        <td>{opportunity.dealCurrency || 'USD'}</td>
                                        <td><Badge bg={STAGE_COLORS[opportunity.stage] || 'secondary'} className="fw-normal">{opportunity.stage}</Badge></td>
                                        <td>{formatDate(opportunity.startDate || opportunity.start)}</td>
                                        <td>{formatDate(opportunity.expectedCloseDate || opportunity.closeDate)}</td>
                                        <td>
                                            <Button size="sm" variant="soft-primary" className="me-1 btn-icon btn-rounded" title="Edit opportunity" onClick={() => openEdit(opportunity)}><i className="ri-edit-line" /></Button>
                                            <Button size="sm" variant="soft-danger" className="btn-icon btn-rounded" title="Delete opportunity" onClick={() => deleteOpportunity(opportunity.id)}><i className="ri-delete-bin-line" /></Button>
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
                    <Modal.Title>{editing ? 'Edit Opportunity' : 'New Opportunity'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={6}><Form.Group><Form.Label>Opportunity Name <span className="text-danger">*</span></Form.Label><Form.Control placeholder="e.g. Q1 Enterprise Deal" value={form.name} onChange={e => handleChange('name', e.target.value)} isInvalid={!!errors.name} /><Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Company <span className="text-danger">*</span></Form.Label><Form.Control placeholder="Company name" value={form.company} onChange={e => handleChange('company', e.target.value)} isInvalid={!!errors.company} /><Form.Control.Feedback type="invalid">{errors.company}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Contact Person</Form.Label><Form.Control placeholder="Contact name" value={form.contactName} onChange={e => handleChange('contactName', e.target.value)} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Deal Value <span className="text-danger">*</span></Form.Label><Form.Control type="number" placeholder="0.00" value={form.dealValue} onChange={e => handleChange('dealValue', e.target.value)} isInvalid={!!errors.dealValue} /><Form.Control.Feedback type="invalid">{errors.dealValue}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Currency</Form.Label><Form.Select value={form.dealCurrency} onChange={e => handleChange('dealCurrency', e.target.value)}>{CURRENCIES.map(currency => <option key={currency.value} value={currency.value}>{currency.label}</option>)}</Form.Select></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Stage <span className="text-danger">*</span></Form.Label><Form.Select value={form.stage} onChange={e => handleChange('stage', e.target.value)} isInvalid={!!errors.stage}>{STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}</Form.Select><Form.Control.Feedback type="invalid">{errors.stage}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Start Date <span className="text-danger">*</span></Form.Label><Form.Control type="date" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} isInvalid={!!errors.startDate} /><Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Expected Close Date <span className="text-danger">*</span></Form.Label><Form.Control type="date" value={form.expectedCloseDate} onChange={e => handleChange('expectedCloseDate', e.target.value)} isInvalid={!!errors.expectedCloseDate} /><Form.Control.Feedback type="invalid">{errors.expectedCloseDate}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={12}><Form.Group><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} placeholder="Additional notes..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} /></Form.Group></Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Opportunity'}</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

const mapStateToProps = ({ opportunities }) => ({ opportunities });
export default connect(mapStateToProps, { addOpportunity, updateOpportunity, deleteOpportunity })(Opportunities);
