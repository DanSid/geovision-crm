import React, { useMemo, useState } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { connect } from 'react-redux';
import { addOpportunityWithHistory, deleteOpportunity } from '../../../../redux/action/Crm';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const stageBg = {
    Prospecting: 'secondary',
    Qualification: 'info',
    Proposal: 'primary',
    Negotiation: 'warning',
    'Closed Won': 'success',
    'Closed Lost': 'danger',
};

const CURRENCIES = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'GHS', label: 'Ghana Cedi (₵)', symbol: '₵' },
];

const emptyForm = {
    name: '', company: '', dealValue: '', dealCurrency: 'USD',
    stage: 'Prospecting', startDate: '', expectedCloseDate: '', notes: '',
};

const currency = (value, symbol) =>
    (value === '' || value === null || value === undefined ? '—' : `${symbol}${Number(value).toLocaleString()}`);

const OpportunitiesTab = ({ entityType, entityId, contactName, opportunities, addOpportunityWithHistory, deleteOpportunity }) => {
    const [show, setShow] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const myOpps = useMemo(() => opportunities
        .filter(opp =>
            String(opp.contactId) === String(entityId) ||
            (contactName && opp.contactName === contactName) ||
            (entityType === 'company' && String(opp.companyId) === String(entityId))
        )
        .map(opp => ({
            ...opp,
            dealValue:         opp.dealValue ?? opp.value ?? opp.valueUsd ?? '',
            dealCurrency:      `${opp.dealCurrency || opp.currency || 'USD'}`.toUpperCase(),
            startDate:         opp.startDate || opp.start || opp.createdAt || '',
            expectedCloseDate: opp.expectedCloseDate || opp.closeDate || '',
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [opportunities, entityId, contactName, entityType]);

    const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

    const validate = () => {
        const nextErrors = {};
        if (!form.name.trim())       nextErrors.name = 'Name is required';
        if (!form.company.trim())    nextErrors.company = 'Company is required';
        if (form.dealValue === '' || form.dealValue === null) nextErrors.dealValue = 'Deal value is required';
        if (!form.startDate)         nextErrors.startDate = 'Start date is required';
        if (!form.expectedCloseDate) nextErrors.expectedCloseDate = 'Expected close date is required';
        return nextErrors;
    };

    const handleSave = () => {
        const nextErrors = validate();
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        const startDateISO         = form.startDate         ? new Date(`${form.startDate}T09:00:00`).toISOString()         : '';
        const expectedCloseDateISO = form.expectedCloseDate ? new Date(`${form.expectedCloseDate}T17:00:00`).toISOString() : '';

        const payload = {
            // canonical fields (what /apps/opportunities reads)
            name:              form.name,
            company:           form.company,
            dealValue:         form.dealValue,
            dealCurrency:      form.dealCurrency,
            stage:             form.stage,
            startDate:         startDateISO,
            expectedCloseDate: expectedCloseDateISO,
            notes:             form.notes,
            // legacy aliases for normalizeOpportunity fallbacks
            value:    form.dealValue,
            amount:   form.dealValue,
            currency: form.dealCurrency,
            start:    startDateISO,
            end:      expectedCloseDateISO,
            closeDate: expectedCloseDateISO,
            valueUsd: form.dealCurrency === 'USD' ? form.dealValue : '',
            valueGhs: form.dealCurrency === 'GHS' ? form.dealValue : '',
            // relationship fields
            contactId:   entityType === 'contact' ? entityId : null,
            companyId:   entityType === 'company' ? entityId : null,
            contactName: contactName || '',
        };

        addOpportunityWithHistory(payload, entityType, entityId);
        setForm(emptyForm);
        setErrors({});
        setShow(false);
    };

    const fmt = (date) =>
        date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    const currencySymbol = (code) => {
        const cur = CURRENCIES.find(c => c.value === (code || '').toUpperCase());
        return cur ? cur.symbol : '$';
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">{myOpps.length} opportunit{myOpps.length === 1 ? 'y' : 'ies'}</h6>
                <Button size="sm" variant="primary" onClick={() => setShow(true)}>
                    <Plus size={14} className="me-1" />Add Opportunity
                </Button>
            </div>

            {myOpps.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="mb-2">No opportunities linked yet.</p>
                    <Button size="sm" variant="outline-primary" onClick={() => setShow(true)}>Add first opportunity</Button>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover size="sm" className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Stage</th>
                                <th>Value</th>
                                <th>Start Date</th>
                                <th>Expected Close</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOpps.map(opp => (
                                <tr key={opp.id}>
                                    <td className="fw-medium fs-7">{opp.name}</td>
                                    <td className="fs-7">{opp.company}</td>
                                    <td>
                                        <Badge bg={stageBg[opp.stage] || 'secondary'} className="fw-normal">{opp.stage}</Badge>
                                    </td>
                                    <td className="fs-7">{currency(opp.dealValue, currencySymbol(opp.dealCurrency))}</td>
                                    <td className="fs-7">{fmt(opp.startDate)}</td>
                                    <td className="fs-7">{fmt(opp.expectedCloseDate)}</td>
                                    <td>
                                        <Button
                                            variant="flush-dark" size="sm"
                                            className="btn-icon btn-rounded p-0"
                                            onClick={() => deleteOpportunity(opp.id)}
                                        >
                                            <span className="feather-icon" style={{ fontSize: 13 }}>✕</span>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            <Modal show={show} onHide={() => { setShow(false); setErrors({}); setForm(emptyForm); }}>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">Add Opportunity</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        {/* Row 1 – Opportunity Name (full width) */}
                        <div className="col-12">
                            <Form.Label className="fs-7">Opportunity Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                size="sm" value={form.name}
                                onChange={e => set('name', e.target.value)}
                                isInvalid={!!errors.name}
                                placeholder="e.g. Website Redesign"
                            />
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </div>

                        {/* Row 2 – Company | Stage */}
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Company <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                size="sm" value={form.company}
                                onChange={e => set('company', e.target.value)}
                                isInvalid={!!errors.company}
                                placeholder="Company name"
                            />
                            <Form.Control.Feedback type="invalid">{errors.company}</Form.Control.Feedback>
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Stage</Form.Label>
                            <Form.Select size="sm" value={form.stage} onChange={e => set('stage', e.target.value)}>
                                {STAGES.map(s => <option key={s}>{s}</option>)}
                            </Form.Select>
                        </div>

                        {/* Row 3 – Deal Value | Currency */}
                          <div className="col-md-6">
                            <Form.Label className="fs-7">Currency</Form.Label>
                            <Form.Select size="sm" value={form.dealCurrency} onChange={e => set('dealCurrency', e.target.value)}>
                                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </Form.Select>
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Deal Value <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                size="sm" type="number" min="0" step="0.01"
                                value={form.dealValue}
                                onChange={e => set('dealValue', e.target.value)}
                                isInvalid={!!errors.dealValue}
                                placeholder="0.00"
                            />
                            <Form.Control.Feedback type="invalid">{errors.dealValue}</Form.Control.Feedback>
                        </div>
                      

                        {/* Row 4 – Start Date | Expected Close Date */}
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Start Date <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                size="sm" type="date"
                                value={form.startDate}
                                onChange={e => set('startDate', e.target.value)}
                                isInvalid={!!errors.startDate}
                            />
                            <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                        </div>
                        <div className="col-md-6">
                            <Form.Label className="fs-7">Expected Close Date <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                size="sm" type="date"
                                value={form.expectedCloseDate}
                                onChange={e => set('expectedCloseDate', e.target.value)}
                                isInvalid={!!errors.expectedCloseDate}
                            />
                            <Form.Control.Feedback type="invalid">{errors.expectedCloseDate}</Form.Control.Feedback>
                        </div>

                        {/* Row 5 – Notes (full width) */}
                        <div className="col-12">
                            <Form.Label className="fs-7">Notes</Form.Label>
                            <Form.Control
                                as="textarea" rows={2} size="sm"
                                value={form.notes}
                                onChange={e => set('notes', e.target.value)}
                                placeholder="Optional notes..."
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => { setShow(false); setErrors({}); setForm(emptyForm); }}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ opportunities }) => ({ opportunities });
export default connect(mapStateToProps, { addOpportunityWithHistory, deleteOpportunity })(OpportunitiesTab);
