import React, { useMemo, useState } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import { Edit2, Plus, Trash2 } from 'react-feather';
import { connect } from 'react-redux';
import { addOpportunityWithHistory, updateOpportunity, deleteOpportunity } from '../../../../redux/action/Crm';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const stageBg = {
    Prospecting:   'secondary',
    Qualification: 'info',
    Proposal:      'primary',
    Negotiation:   'warning',
    'Closed Won':  'success',
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

const toDateInput = (iso) => iso ? iso.slice(0, 10) : '';

const OpportunitiesTab = ({
    entityType, entityId, contactName,
    opportunities,
    addOpportunityWithHistory, updateOpportunity, deleteOpportunity,
}) => {
    /* ── modal state (add / edit) ── */
    const [show, setShow]           = useState(false);
    const [editingOpp, setEditingOpp] = useState(null);   // null = add, opp = edit
    const [form, setForm]           = useState(emptyForm);
    const [errors, setErrors]       = useState({});

    /* ── inline stage state ── */
    const [stageEditId, setStageEditId] = useState(null); // opp.id being edited inline

    /* ── filtered & normalised opportunities ── */
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

    /* ── helpers ── */
    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const openAdd = () => {
        setEditingOpp(null);
        setForm(emptyForm);
        setErrors({});
        setShow(true);
    };

    const openEdit = (opp) => {
        setEditingOpp(opp);
        setForm({
            name:              opp.name || '',
            company:           opp.company || '',
            dealValue:         opp.dealValue ?? opp.value ?? '',
            dealCurrency:      (opp.dealCurrency || opp.currency || 'USD').toUpperCase(),
            stage:             opp.stage || 'Prospecting',
            startDate:         toDateInput(opp.startDate || opp.start || opp.createdAt),
            expectedCloseDate: toDateInput(opp.expectedCloseDate || opp.closeDate),
            notes:             opp.notes || '',
        });
        setErrors({});
        setShow(true);
    };

    const closeModal = () => { setShow(false); setEditingOpp(null); setErrors({}); setForm(emptyForm); };

    const validate = () => {
        const e = {};
        if (!form.name.trim())       e.name = 'Name is required';
        if (!form.company.trim())    e.company = 'Company is required';
        if (form.dealValue === '' || form.dealValue === null) e.dealValue = 'Deal value is required';
        if (!form.startDate)         e.startDate = 'Start date is required';
        if (!form.expectedCloseDate) e.expectedCloseDate = 'Expected close date is required';
        return e;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const startISO    = form.startDate         ? new Date(`${form.startDate}T09:00:00`).toISOString()         : '';
        const closeISO    = form.expectedCloseDate ? new Date(`${form.expectedCloseDate}T17:00:00`).toISOString() : '';

        const payload = {
            name:              form.name,
            company:           form.company,
            dealValue:         form.dealValue,
            dealCurrency:      form.dealCurrency,
            stage:             form.stage,
            startDate:         startISO,
            expectedCloseDate: closeISO,
            notes:             form.notes,
            // legacy aliases
            value:    form.dealValue, amount: form.dealValue,
            currency: form.dealCurrency,
            start: startISO, end: closeISO, closeDate: closeISO,
            // relationship
            contactId:   entityType === 'contact' ? entityId : null,
            companyId:   entityType === 'company' ? entityId : null,
            contactName: contactName || '',
        };

        if (editingOpp) {
            updateOpportunity({ ...editingOpp, ...payload });
        } else {
            addOpportunityWithHistory(payload, entityType, entityId);
        }
        closeModal();
    };

    /* ── inline stage change ── */
    const handleStageChange = (opp, newStage) => {
        updateOpportunity({ ...opp, stage: newStage, value: opp.dealValue, currency: opp.dealCurrency });
        setStageEditId(null);
    };

    const fmt = (date) =>
        date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    const currencySymbol = (code) => {
        const cur = CURRENCIES.find(c => c.value === (code || '').toUpperCase());
        return cur ? cur.symbol : '$';
    };

    /* ════════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════════ */
    return (
        <div>
            {/* ── Header ── */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">
                    {myOpps.length} opportunit{myOpps.length === 1 ? 'y' : 'ies'}
                </h6>
                <Button size="sm" variant="primary" onClick={openAdd}>
                    <Plus size={14} className="me-1" />Add Opportunity
                </Button>
            </div>

            {/* ── Table ── */}
            {myOpps.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="mb-2">No opportunities linked yet.</p>
                    <Button size="sm" variant="outline-primary" onClick={openAdd}>Add first opportunity</Button>
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
                                <th style={{ width: 80 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOpps.map(opp => (
                                <tr key={opp.id}>
                                    <td className="fw-medium fs-7">{opp.name}</td>
                                    <td className="fs-7">{opp.company}</td>

                                    {/* ── Inline stage cell ── */}
                                    <td>
                                        {stageEditId === opp.id ? (
                                            <Form.Select
                                                size="sm"
                                                autoFocus
                                                defaultValue={opp.stage}
                                                onChange={e => handleStageChange(opp, e.target.value)}
                                                onBlur={() => setStageEditId(null)}
                                                style={{ minWidth: 130 }}
                                            >
                                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </Form.Select>
                                        ) : (
                                            <Badge
                                                bg={stageBg[opp.stage] || 'secondary'}
                                                className="fw-normal"
                                                style={{ cursor: 'pointer' }}
                                                title="Click to change stage"
                                                onClick={() => setStageEditId(opp.id)}
                                            >
                                                {opp.stage}
                                            </Badge>
                                        )}
                                    </td>

                                    <td className="fs-7">{currency(opp.dealValue, currencySymbol(opp.dealCurrency))}</td>
                                    <td className="fs-7">{fmt(opp.startDate)}</td>
                                    <td className="fs-7">{fmt(opp.expectedCloseDate)}</td>

                                    {/* ── Actions ── */}
                                    <td>
                                        <Button
                                            variant="soft-primary" size="sm"
                                            className="btn-icon btn-rounded me-1"
                                            title="Edit opportunity"
                                            onClick={() => openEdit(opp)}
                                        >
                                            <Edit2 size={13} />
                                        </Button>
                                        <Button
                                            variant="soft-danger" size="sm"
                                            className="btn-icon btn-rounded"
                                            title="Delete opportunity"
                                            onClick={() => {
                                                if (window.confirm(`Delete "${opp.name}"?`)) deleteOpportunity(opp.id);
                                            }}
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                ADD / EDIT MODAL
            ════════════════════════════════════════════════════════════════ */}
            <Modal show={show} onHide={closeModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">{editingOpp ? 'Edit Opportunity' : 'Add Opportunity'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        {/* Opportunity Name */}
                        <div className="col-12">
                            <Form.Label className="fs-7">Opportunity Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                size="sm" value={form.name}
                                onChange={e => set('name', e.target.value)}
                                isInvalid={!!errors.name}
                                placeholder="e.g. Website Redesign"
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </div>

                        {/* Company | Stage */}
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
                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </Form.Select>
                        </div>

                        {/* Currency | Deal Value */}
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

                        {/* Dates */}
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

                        {/* Notes */}
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
                    <Button variant="secondary" size="sm" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                        {editingOpp ? 'Save Changes' : 'Add Opportunity'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ opportunities }) => ({ opportunities });
export default connect(mapStateToProps, {
    addOpportunityWithHistory,
    updateOpportunity,
    deleteOpportunity,
})(OpportunitiesTab);
