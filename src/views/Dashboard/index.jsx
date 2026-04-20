import React, { useEffect, useMemo } from 'react';
import { Col, Container, Row, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import AudienceReviewCard from './AudienceReviewCard';
import CustomerTable from './CustomerTable';

const StatCard = ({ title, value, icon, color, to, sub }) => (
    <Card className="border-0 shadow-sm h-100">
        <Card.Body className="d-flex align-items-center gap-3">
            <div
                className={`avatar avatar-lg avatar-rounded d-flex align-items-center justify-content-center bg-${color}-light-5`}
                style={{ minWidth: 56, width: 56, height: 56 }}
            >
                <i className={`${icon} fs-4 text-${color}`} />
            </div>
            <div>
                <p className="text-muted mb-0 fs-7">{title}</p>
                <h4 className="mb-0 fw-bold">{value}</h4>
                {sub && <span className="fs-7 text-muted">{sub}</span>}
            </div>
            {to && <Link to={to} className="stretched-link" />}
        </Card.Body>
    </Card>
);

const money = (value, symbol) => `${symbol}${Number(value || 0).toLocaleString()}`;
const dealAmount = (opportunity = {}) => Number(opportunity.dealValue ?? opportunity.value ?? opportunity.amount ?? 0) || 0;
const dealCurrency = (opportunity = {}) => `${opportunity.dealCurrency || opportunity.currency || opportunity.valueCurrency || 'USD'}`.toUpperCase();

const Dashboard = ({ navCollapsed, toggleCollapsedNav, contacts, opportunities, customers, tasks, currentUser }) => {
    useEffect(() => {
        toggleCollapsedNav(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openOpps = opportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage)).length;
    const wonOpps = opportunities.filter(o => o.stage === 'Closed Won').length;

    const pipelineTotals = useMemo(() => opportunities.reduce((acc, opp) => {
        const amount = dealAmount(opp);
        if (dealCurrency(opp) === 'GHS') acc.ghs += amount;
        else acc.usd += amount;
        return acc;
    }, { usd: 0, ghs: 0 }), [opportunities]);

    const pendingTasks = tasks.filter(t => !t.done).length;
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const recentContacts = [...contacts].reverse().slice(0, 5);
    const recentOpps = [...opportunities].reverse().slice(0, 5);

    return (
        <Container fluid className="py-4">
            <div className="mb-4">
                <h1 className="pg-title mb-1">
                    Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}!
                </h1>
                <p className="text-muted">Here's what's happening in your CRM today.</p>
            </div>

            <Row className="g-3 mb-4">
                <Col xl={3} md={6}>
                    <StatCard
                        title="Total Contacts"
                        value={contacts.length}
                        icon="ri-contacts-book-line"
                        color="primary"
                        to="/apps/contacts/contact-list"
                    />
                </Col>
                <Col xl={3} md={6}>
                    <StatCard
                        title="Open Opportunities"
                        value={openOpps}
                        icon="ri-bar-chart-line"
                        color="warning"
                        to="/apps/opportunities"
                        sub={`Pipeline: ${money(pipelineTotals.usd, '$')} | ${money(pipelineTotals.ghs, '₵')}`}
                    />
                </Col>
                <Col xl={3} md={6}>
                    <StatCard
                        title="Active Customers"
                        value={activeCustomers}
                        icon="ri-user-3-line"
                        color="success"
                        to="/apps/customers"
                        sub={`${customers.length} total`}
                    />
                </Col>
                <Col xl={3} md={6}>
                    <StatCard
                        title="Pending Tasks"
                        value={pendingTasks}
                        icon="ri-task-line"
                        color="info"
                        to="/apps/tasks/task-list"
                        sub={`${tasks.length} total`}
                    />
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="avatar avatar-lg avatar-rounded d-flex align-items-center justify-content-center bg-violet-light-5" style={{ minWidth: 56, width: 56, height: 56 }}>
                                <i className="ri-trophy-line fs-4 text-violet" />
                            </div>
                            <div>
                                <p className="text-muted mb-0 fs-7">Closed Won</p>
                                <h4 className="mb-0 fw-bold text-success">{wonOpps}</h4>
                                <span className="fs-7 text-muted">opportunities</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="avatar avatar-lg avatar-rounded d-flex align-items-center justify-content-center bg-pink-light-5" style={{ minWidth: 56, width: 56, height: 56 }}>
                                <i className="ri-money-dollar-circle-line fs-4 text-pink" />
                            </div>
                            <div>
                                <p className="text-muted mb-0 fs-7">Total Pipeline</p>
                                <h4 className="mb-0 fw-bold">{money(pipelineTotals.usd, '$')}</h4>
                                <h6 className="mb-0 fw-bold text-muted">{money(pipelineTotals.ghs, '₵')}</h6>
                                <span className="fs-7 text-muted">across {opportunities.length} opportunities</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <h6 className="mb-0">Recent Contacts</h6>
                            <Link to="/apps/contacts/contact-list" className="fs-7 text-primary">View all</Link>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {recentContacts.length === 0 ? (
                                <div className="text-center py-4 text-muted fs-7">
                                    No contacts yet. <Link to="/apps/contacts/contact-list">Add one</Link>
                                </div>
                            ) : (
                                <ul className="list-unstyled mb-0">
                                    {recentContacts.map(c => (
                                        <li key={c.id} className="px-3 py-2 border-bottom d-flex align-items-center gap-2">
                                            <div className="avatar avatar-xs avatar-rounded d-flex align-items-center justify-content-center text-white fw-bold" style={{ background: '#4f46e5', width: 30, height: 30, minWidth: 30, fontSize: 12 }}>
                                                {(c.firstName || c.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-medium fs-7">{c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.name || 'Unknown'}</div>
                                                <div className="text-muted" style={{ fontSize: 11 }}>{c.email || c.department || ''}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <h6 className="mb-0">Recent Opportunities</h6>
                            <Link to="/apps/opportunities" className="fs-7 text-primary">View all</Link>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {recentOpps.length === 0 ? (
                                <div className="text-center py-4 text-muted fs-7">
                                    No opportunities yet. <Link to="/apps/opportunities">Add one</Link>
                                </div>
                            ) : (
                                <ul className="list-unstyled mb-0">
                                    {recentOpps.map(o => (
                                        <li key={o.id} className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between gap-2">
                                            <div>
                                                <div className="fw-medium fs-7">{o.name}</div>
                                                <div className="text-muted" style={{ fontSize: 11 }}>{o.company}</div>
                                            </div>
                                            <div className="text-end">
                                                <Badge bg={
                                                    o.stage === 'Closed Won' ? 'success' :
                                                    o.stage === 'Closed Lost' ? 'danger' :
                                                    o.stage === 'Proposal' ? 'warning' : 'info'
                                                } className="fw-normal fs-8 mb-1">
                                                    {o.stage}
                                                </Badge>
                                                <div className="fs-7 text-muted">
                                                    {money(dealAmount(o), dealCurrency(o) === 'GHS' ? '₵' : '$')} {dealCurrency(o)}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3">
                <Col md={12} className="mb-3">
                    <AudienceReviewCard />
                </Col>
                <Col md={12}>
                    <CustomerTable />
                </Col>
            </Row>
        </Container>
    );
};

const mapStateToProps = ({ theme, auth, contacts, opportunities, customers, tasks }) => ({
    navCollapsed: theme.navCollapsed,
    currentUser: auth.currentUser,
    contacts,
    opportunities,
    customers,
    tasks,
});

export default connect(mapStateToProps, { toggleCollapsedNav })(Dashboard);
