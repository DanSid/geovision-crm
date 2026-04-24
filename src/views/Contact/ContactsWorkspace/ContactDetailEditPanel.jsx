import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

/* ── Standard departments ─────────────────────────────────────────────────── */
const DEFAULT_DEPARTMENTS = [
    'Administration', 'Corporate', 'Customer Service', 'Engineering',
    'Facilities', 'Finance/Accounting', 'Human Resources',
    'Information Technology', 'Legal', 'Manufacturing', 'Marketing',
    'Production', 'Public Relations', 'Purchasing', 'Sales',
    'Security', 'Service', 'Shipping', 'Technical Support',
];

const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Rev.', 'Sir', 'Lady'];

/* ── Department dropdown with add-custom ability ─────────────────────────── */
const DepartmentSelect = ({ value, onChange }) => {
    const [customDepts, setCustomDepts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('gv_custom_depts') || '[]'); } catch { return []; }
    });
    const [addingNew, setAddingNew] = useState(false);
    const [newDept, setNewDept]     = useState('');

    const allDepts = useMemo(
        () => [...new Set([...DEFAULT_DEPARTMENTS, ...customDepts])].sort(),
        [customDepts]
    );

    const handleAdd = () => {
        const trimmed = newDept.trim();
        if (!trimmed) return;
        const updated = [...customDepts, trimmed];
        setCustomDepts(updated);
        localStorage.setItem('gv_custom_depts', JSON.stringify(updated));
        onChange(trimmed);
        setNewDept('');
        setAddingNew(false);
    };

    if (addingNew) {
        return (
            <InputGroup size="sm">
                <Form.Control
                    autoFocus
                    placeholder="New department name"
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter')  handleAdd();
                        if (e.key === 'Escape') setAddingNew(false);
                    }}
                    style={{ fontSize: 12 }}
                />
                <Button variant="success"          size="sm" onClick={handleAdd}>Add</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setAddingNew(false)}>✕</Button>
            </InputGroup>
        );
    }

    return (
        <Form.Select
            size="sm"
            value={value || ''}
            onChange={e => {
                if (e.target.value === '__add_new__') setAddingNew(true);
                else onChange(e.target.value);
            }}
            style={{ fontSize: 12 }}
        >
            <option value="">— Select Department —</option>
            {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
            <option value="__add_new__">＋ Add new department…</option>
        </Form.Select>
    );
};

/* ── Editable field row ──────────────────────────────────────────────────── */
const EditRow = ({ label, children }) => (
    <div className="d-flex align-items-start mb-2">
        <span
            className="text-muted flex-shrink-0 pt-1"
            style={{ fontSize: 12, width: 108, paddingRight: 8 }}
        >
            {label}
        </span>
        <div style={{ flex: 1 }}>{children}</div>
    </div>
);

/* ── Read-only row (Latest Activities) ───────────────────────────────────── */
const ReadRow = ({ label, value }) => (
    <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
        <span className="text-muted" style={{ fontSize: 12 }}>{label}</span>
        <span className="fw-medium" style={{ fontSize: 12 }}>{value ?? '—'}</span>
    </div>
);

/* ── Thin text input ─────────────────────────────────────────────────────── */
const TInput = ({ field, type = 'text', placeholder = '', form, onChange }) => (
    <Form.Control
        size="sm"
        type={type}
        value={form[field] || ''}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
        style={{ fontSize: 12 }}
    />
);

/* ══════════════════════════════════════════════════════════════════════════
   ContactDetailEditPanel
══════════════════════════════════════════════════════════════════════════ */
const ContactDetailEditPanel = ({ form, onChange, activities = [], opportunities = [], companies = [] }) => {
    const cId = form?.id || form?._id;

    const myActivities = useMemo(
        () => activities.filter(a => String(a.entityId) === String(cId) && a.entityType === 'contact'),
        [activities, cId]
    );

    const myOpps = useMemo(
        () => opportunities.filter(o =>
            String(o.contactId) === String(cId) ||
            (form?.firstName && o.contactName === `${form.firstName} ${form.lastName || ''}`.trim())
        ),
        [opportunities, cId, form]
    );

    const openOpps = myOpps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));

    const lastEmail   = [...myActivities.filter(a => a.type === 'Email')]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const lastCall    = [...myActivities.filter(a => a.type === 'Call')]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const lastMeeting = [...myActivities.filter(a => a.type === 'Meeting')]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const fmtDate = iso =>
        iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    const inp = (field, type = 'text', ph = '') => (
        <TInput field={field} type={type} placeholder={ph} form={form} onChange={onChange} />
    );

    if (!form) return null;

    return (
        <Row className="g-2 p-3 border-bottom bg-body">

            {/* ── Business Card ── */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-body-secondary border-bottom">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Business Card</h6>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <EditRow label="First Name">{inp('firstName', 'text', 'First name')}</EditRow>
                        <EditRow label="Last Name">{inp('lastName',  'text', 'Last name')}</EditRow>
                        <EditRow label="Company">{inp('company', 'text', 'Company name')}</EditRow>
                        <EditRow label="Title / Role">{inp('designation', 'text', 'Job title')}</EditRow>
                        <EditRow label="Department">
                            <DepartmentSelect
                                value={form.department || ''}
                                onChange={v => onChange('department', v)}
                            />
                        </EditRow>
                        <EditRow label="Salutation">
                            <Form.Select
                                size="sm"
                                value={form.salutation || ''}
                                onChange={e => onChange('salutation', e.target.value)}
                                style={{ fontSize: 12 }}
                            >
                                <option value="">—</option>
                                {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </Form.Select>
                        </EditRow>
                        <EditRow label="Phone">{inp('phone', 'tel', '+233 000 000 0000')}</EditRow>
                        <EditRow label="Work Phone">{inp('workPhone', 'tel', 'Work phone')}</EditRow>
                        <EditRow label="Mobile">{inp('mobile', 'tel', 'Mobile number')}</EditRow>
                        <EditRow label="E-mail">{inp('email', 'email', 'email@example.com')}</EditRow>
                    </Card.Body>
                </Card>
            </Col>

            {/* ── Address ── */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-body-secondary border-bottom">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Address</h6>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <EditRow label="Address 1">{inp('address1', 'text', 'Street address')}</EditRow>
                        <EditRow label="Address 2">{inp('address2', 'text', 'Apt, suite, unit…')}</EditRow>
                        <EditRow label="City">{inp('city',    'text', 'City')}</EditRow>
                        <EditRow label="State/Region">{inp('state', 'text', 'State or county')}</EditRow>
                        <EditRow label="Post/ZIP">{inp('post', 'text', 'Postal code')}</EditRow>
                        <EditRow label="Country">{inp('country', 'text', 'Country')}</EditRow>
                        <EditRow label="Fax">{inp('fax', 'tel', 'Fax number')}</EditRow>
                        <EditRow label="Web Site">{inp('website', 'url', 'https://')}</EditRow>
                    </Card.Body>
                </Card>
            </Col>

            {/* ── Status ── */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-body-secondary border-bottom">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Status</h6>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <EditRow label="ID / Status">{inp('idStatus', 'text', 'Status identifier')}</EditRow>
                        <EditRow label="Referred By">{inp('referredBy', 'text', 'Who referred them')}</EditRow>
                        <EditRow label="Favorite">
                            <Form.Check
                                type="checkbox"
                                checked={!!form.favorite}
                                onChange={e => onChange('favorite', e.target.checked)}
                                style={{ marginTop: 2 }}
                            />
                        </EditRow>
                        <EditRow label="AMA Score">{inp('amaScore', 'text', 'Score')}</EditRow>
                        <EditRow label="Labels">{inp('labels', 'text', 'Comma-separated tags')}</EditRow>
                        <EditRow label="Biography">
                            <Form.Control
                                as="textarea"
                                size="sm"
                                rows={4}
                                value={form.biography || ''}
                                onChange={e => onChange('biography', e.target.value)}
                                placeholder="Notes / biography…"
                                style={{ fontSize: 12 }}
                            />
                        </EditRow>
                    </Card.Body>
                </Card>
            </Col>

            {/* ── Latest Activities (read-only) ── */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-body-secondary border-bottom">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Latest Activities</h6>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <ReadRow label="E-mail count"    value={myActivities.filter(a => a.type === 'Email').length}   />
                        <ReadRow label="Call Attempt"    value={myActivities.filter(a => a.type === 'Call').length}    />
                        <ReadRow label="Meeting"         value={myActivities.filter(a => a.type === 'Meeting').length} />
                        <ReadRow label="Open Opps"       value={openOpps.length}                                        />
                        <ReadRow label="Last E-mail"     value={fmtDate(lastEmail?.createdAt)}                         />
                        <ReadRow label="Last Call"       value={fmtDate(lastCall?.createdAt)}                          />
                        <ReadRow label="Last Meeting"    value={fmtDate(lastMeeting?.createdAt)}                       />
                        <ReadRow label="Record Created"  value={fmtDate(form.createdAt)}                               />
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

const mapState = ({ companies, activities, opportunities }) => ({ companies, activities, opportunities });
export default connect(mapState)(ContactDetailEditPanel);
