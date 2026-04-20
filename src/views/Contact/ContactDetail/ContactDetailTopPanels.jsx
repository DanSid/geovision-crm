import React from 'react';
import { Badge, Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';

const InfoRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="d-flex gap-2 mb-1">
            <span className="text-muted fs-7" style={{ minWidth: 90 }}>{label}</span>
            <span className="fs-7 fw-medium">{value}</span>
        </div>
    );
};

const ContactDetailTopPanels = ({ contact, companies, activities, opportunities }) => {
    if (!contact) return null;

    const company = companies.find(c => String(c.id) === String(contact.companyId));
    const myActivities = activities.filter(a => String(a.entityId) === String(contact.id) && a.entityType === 'contact');
    const myOpps = opportunities.filter(o =>
        String(o.contactId) === String(contact.id) ||
        (contact.firstName && o.contactName === `${contact.firstName} ${contact.lastName || ''}`.trim())
    );
    const openOpps = myOpps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));
    const lastActivity = myActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const fmtDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const tags = contact.tags ? contact.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
        <Row className="g-3 mb-0 p-3 border-bottom" style={{ background: '#f8f9fa' }}>
            {/* Business Card */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-white border-bottom d-flex align-items-center justify-content-between">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Business Card</h6>
                        <div className="d-flex gap-1">
                            {(contact.phone || contact.mobile) && (
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Call {contact.phone || contact.mobile}</Tooltip>}
                                >
                                    <a
                                        href={`tel:${contact.phone || contact.mobile}`}
                                        className="btn btn-sm btn-icon rounded-circle"
                                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', color: '#059669' }}
                                    >
                                        <i className="ri-phone-line" style={{ fontSize: 13 }} />
                                    </a>
                                </OverlayTrigger>
                            )}
                            {contact.email && (
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Email {contact.email}</Tooltip>}
                                >
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="btn btn-sm btn-icon rounded-circle"
                                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dbeafe', color: '#2563eb' }}
                                    >
                                        <i className="ri-mail-line" style={{ fontSize: 13 }} />
                                    </a>
                                </OverlayTrigger>
                            )}
                        </div>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <InfoRow label="Contact" value={`${contact.firstName || ''} ${contact.lastName || ''}`.trim()} />
                        <InfoRow label="Company" value={company?.name || contact.company || ''} />
                        <InfoRow label="Department" value={contact.department} />
                        <InfoRow label="Phone" value={contact.phone} />
                        <InfoRow label="Mobile" value={contact.mobile} />
                        <InfoRow label="E-mail" value={contact.email} />
                        <InfoRow label="Salutation" value={contact.salutation} />
                    </Card.Body>
                </Card>
            </Col>

            {/* Address */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-white border-bottom">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Address</h6>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <InfoRow label="Address 1" value={contact.address1} />
                        <InfoRow label="Address 2" value={contact.address2} />
                        <InfoRow label="City" value={contact.city} />
                        <InfoRow label="County" value={contact.county} />
                        <InfoRow label="Post" value={contact.post} />
                        <InfoRow label="Country" value={contact.country} />
                        <InfoRow label="Fax" value={contact.fax} />
                        <InfoRow label="Web Site" value={contact.website} />
                    </Card.Body>
                </Card>
            </Col>

            {/* Status */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-white border-bottom">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Status</h6>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <InfoRow label="ID/Status" value={contact.idStatus} />
                        <InfoRow label="Referred By" value={contact.referredBy} />
                        <div className="d-flex gap-2 mb-1">
                            <span className="text-muted fs-7" style={{ minWidth: 90 }}>Favorite</span>
                            <input type="checkbox" checked={!!contact.favorite} readOnly className="mt-1" />
                        </div>
                        <InfoRow label="AMA Score" value={contact.amaScore} />
                        <div className="mt-2">
                            {tags.map((t, i) => (
                                <Badge key={i} bg="light" text="dark" className="me-1 mb-1 border fs-8">{t}</Badge>
                            ))}
                        </div>
                        <div className="mt-2">
                            <span className="text-muted fs-7" style={{ minWidth: 90 }}>Added</span>
                            <span className="fs-7 ms-2">{fmtDate(contact.createdAt)}</span>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            {/* Latest Activities */}
            <Col xl={3} md={6}>
                <Card className="h-100 shadow-none border">
                    <Card.Header className="py-2 px-3 bg-white border-bottom">
                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Latest Activities</h6>
                    </Card.Header>
                    <Card.Body className="py-2 px-3">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fs-7">E-mail</span>
                            <span className="fs-7">{myActivities.filter(a => a.type === 'Email').length || '—'}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fs-7">Call Attempt</span>
                            <span className="fs-7">{myActivities.filter(a => a.type === 'Call').length || '—'}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fs-7">Meeting</span>
                            <span className="fs-7">{myActivities.filter(a => a.type === 'Meeting').length || '—'}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fs-7">Open Opps</span>
                            <span className="fs-7 fw-medium text-primary">{openOpps.length}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fs-7">Last Activity</span>
                            <span className="fs-7">{lastActivity ? fmtDate(lastActivity.createdAt) : '—'}</span>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

const mapStateToProps = ({ companies, activities, opportunities }) => ({ companies, activities, opportunities });
export default connect(mapStateToProps)(ContactDetailTopPanels);
