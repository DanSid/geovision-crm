import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { Card, Col, Row, Badge, ProgressBar } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { CheckCircle, Edit3, PlusCircle, Clock, Activity } from 'react-feather';
import classNames from 'classnames';
import Sidebar from '../Sidebar';

// ── helpers ───────────────────────────────────────────────────────────────────
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

const COLUMN_COLORS = {
    'Done':           '#00875a',
    'In Progress':    '#0065ff',
    'Delivered':      '#36b37e',
    'Scheduled':      '#8777d9',
    'Estimate Scope': '#f27935',
    'Approved':       '#0052cc',
    'Triage':         '#6e7891',
    'To Do':          '#6e7891',
    'On Hold':        '#adb5bd',
    'Completed':      '#00875a',
};

const PIPELINE_COLORS = {
    Prospecting: '#4c6fff',
    Qualification: '#00a3ff',
    Proposal: '#36b37e',
    Negotiation: '#ffab00',
    'Closed Won': '#00875a',
    'Closed Lost': '#de350b',
    Unknown: '#6e7891',
};

const LOGISTICS_COLORS = {
    Equipment: '#4c6fff',
    'Stock Locations': '#00a3ff',
    'Crew Members': '#36b37e',
    Vehicles: '#8777d9',
    Repairs: '#ffab00',
    Inspections: '#00b8d9',
    'Lost Equipment': '#de350b',
    'Inventory Counts': '#6554c0',
};

const statusToDisplay = (status, done) => {
    if (done || status === 'Completed') return 'Done';
    if (status === 'In Progress') return 'In Progress';
    if (status === 'On Hold' || status === 'Scheduled') return 'Scheduled';
    if (status === 'Review' || status === 'Delivered') return 'Delivered';
    if (status === 'Approved') return 'Approved';
    if (status === 'Estimate Scope') return 'Estimate Scope';
    return 'Triage';
};

const avatarColor = (name) => {
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'pink', 'violet'];
    if (!name) return 'primary';
    return colors[name.charCodeAt(0) % colors.length];
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, count, label, sub, color }) => (
    <Card className="card-border h-100">
        <Card.Body className="d-flex align-items-center gap-3 py-3">
            <div className={`avatar avatar-lg avatar-soft-${color} avatar-rounded flex-shrink-0`}>
                <span className="initial-wrap"><Icon size={20} /></span>
            </div>
            <div>
                <div className="fw-bold fs-4 text-dark lh-1">{count}</div>
                <div className="fw-semibold text-dark" style={{ fontSize: 13 }}>{label}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{sub}</div>
            </div>
        </Card.Body>
    </Card>
);

// ── Main component ────────────────────────────────────────────────────────────
const KanbanSummary = ({
    tasks = [],
    opportunities = [],
    equipment = [],
    stockLocations = [],
    crewMembers = [],
    vehicles = [],
    maintenance = [],
}) => {
    const now = new Date();
    const sevenDaysAgo = daysAgo(7);
    const sevenDaysLater = daysFromNow(7);

    // ── Computed stats ────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const completed = tasks.filter(t => t.done || t.status === 'Completed').length;
        const created   = tasks.filter(t => t.createdAt && new Date(t.createdAt) >= sevenDaysAgo).length;
        const dueSoon   = tasks.filter(t => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d >= now && d <= sevenDaysLater;
        }).length;
        return { completed, updated: tasks.length, created, dueSoon };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]);

    // ── Status breakdown ──────────────────────────────────────────────────────
    const statusGroups = useMemo(() => {
        const groups = {};
        tasks.forEach(t => {
            const s = statusToDisplay(t.status, t.done);
            groups[s] = (groups[s] || 0) + 1;
        });
        return groups;
    }, [tasks]);

    const statusLabels  = Object.keys(statusGroups);
    const statusSeries  = statusLabels.map(k => statusGroups[k]);
    const statusColors  = statusLabels.map(k => COLUMN_COLORS[k] || '#adb5bd');

    const donutOptions = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: statusLabels,
        colors: statusColors,
        legend: { position: 'right', fontSize: '12px' },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '68%', labels: {
            show: true,
            total: { show: true, label: 'Total Work Items', fontSize: '11px',
                     formatter: () => String(tasks.length) },
        } } } },
        tooltip: { y: { formatter: (v) => `${v} items` } },
    };

    const pipelineGroups = useMemo(() => {
        const groups = {};
        opportunities.forEach((opportunity) => {
            const stage = opportunity.stage || 'Unknown';
            groups[stage] = (groups[stage] || 0) + 1;
        });
        return groups;
    }, [opportunities]);

    const pipelineLabels = Object.keys(pipelineGroups);
    const pipelineSeries = pipelineLabels.map((label) => pipelineGroups[label]);
    const pipelineOptions = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: pipelineLabels,
        colors: pipelineLabels.map((label) => PIPELINE_COLORS[label] || PIPELINE_COLORS.Unknown),
        legend: { position: 'right', fontSize: '12px' },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '68%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Opportunities',
                            fontSize: '11px',
                            formatter: () => String(opportunities.length),
                        },
                    },
                },
            },
        },
        tooltip: { y: { formatter: (value) => `${value} opportunities` } },
    };

    const logisticsGroups = useMemo(() => {
        const countByType = (type) => maintenance.filter((record) => record.type === type).length;
        return {
            Equipment: equipment.length,
            'Stock Locations': stockLocations.length,
            'Crew Members': crewMembers.length,
            Vehicles: vehicles.length,
            Repairs: countByType('repair'),
            Inspections: countByType('inspection'),
            'Lost Equipment': countByType('lostEquipment'),
            'Inventory Counts': countByType('inventoryCount'),
        };
    }, [crewMembers, equipment, maintenance, stockLocations, vehicles]);

    const activeLogisticsEntries = Object.entries(logisticsGroups).filter(([, count]) => count > 0);
    const logisticsLabels = activeLogisticsEntries.map(([label]) => label);
    const logisticsSeries = activeLogisticsEntries.map(([, count]) => count);
    const logisticsTotal = logisticsSeries.reduce((sum, count) => sum + count, 0);
    const logisticsOptions = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: logisticsLabels,
        colors: logisticsLabels.map((label) => LOGISTICS_COLORS[label] || '#6e7891'),
        legend: { position: 'right', fontSize: '12px' },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '68%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Logistics Records',
                            fontSize: '11px',
                            formatter: () => String(logisticsTotal),
                        },
                    },
                },
            },
        },
        tooltip: { y: { formatter: (value) => `${value} records` } },
    };

    // ── Priority breakdown ────────────────────────────────────────────────────
    const priorityGroups = useMemo(() => {
        const g = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
        tasks.forEach(t => { if (g[t.priority] !== undefined) g[t.priority]++; });
        return g;
    }, [tasks]);

    const priorityBarOptions = {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
        xaxis: { categories: ['Urgent', 'High', 'Medium', 'Low'],
                 labels: { style: { fontSize: '11px' } } },
        yaxis: { labels: { style: { fontSize: '11px' } } },
        colors: ['#dc3545', '#fd7e14', '#ffc107', '#adb5bd'],
        plotOptions: { bar: { distributed: true, borderRadius: 4, columnWidth: '50%' } },
        dataLabels: { enabled: false },
        legend: { show: false },
        grid: { borderColor: '#f1f2f3' },
        tooltip: { y: { formatter: (v) => `${v} tasks` } },
    };

    // ── Team workload ─────────────────────────────────────────────────────────
    const teamWorkload = useMemo(() => {
        const counts = {};
        tasks.forEach(t => {
            const a = t.assignedTo || 'Unassigned';
            counts[a] = (counts[a] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
    }, [tasks]);

    const maxWorkload = teamWorkload[0]?.[1] || 1;

    // ── Category breakdown ────────────────────────────────────────────────────
    const categoryGroups = useMemo(() => {
        const g = {};
        tasks.forEach(t => { const c = t.category || 'General'; g[c] = (g[c] || 0) + 1; });
        return Object.entries(g).sort((a, b) => b[1] - a[1]);
    }, [tasks]);

    // ── Recent activity ───────────────────────────────────────────────────────
    const recentTasks = useMemo(() => (
        [...tasks]
            .filter(t => t.createdAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
    ), [tasks]);

    const timeAgo = (iso) => {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="hk-pg-body py-0">
            <div className="taskboardapp-wrap">
                <Sidebar />
                <div className="taskboardapp-content">
                    <div className="taskboardapp-detail-wrap" style={{ overflowY: 'auto' }}>

                        {/* Page title */}
                        <div className="px-4 pt-4 pb-2 border-bottom d-flex align-items-center gap-2">
                            <Activity size={18} className="text-primary" />
                            <h5 className="mb-0 fw-bold">Board Summary</h5>
                            <Badge bg="light" text="dark" className="ms-2 border">{tasks.length} total work items</Badge>
                        </div>

                        <div className="p-4">
                            {/* ── Stat Cards ──────────────────────────────── */}
                            <Row className="g-3 mb-4">
                                <Col xs={6} xl={3}>
                                    <StatCard icon={CheckCircle} count={stats.completed} label="Completed"
                                              sub="in total" color="success" />
                                </Col>
                                <Col xs={6} xl={3}>
                                    <StatCard icon={Edit3} count={stats.updated} label="Total Tasks"
                                              sub="all time" color="info" />
                                </Col>
                                <Col xs={6} xl={3}>
                                    <StatCard icon={PlusCircle} count={stats.created} label="Created"
                                              sub="in the last 7 days" color="primary" />
                                </Col>
                                <Col xs={6} xl={3}>
                                    <StatCard icon={Clock} count={stats.dueSoon} label="Due Soon"
                                              sub="in the next 7 days" color="warning" />
                                </Col>
                            </Row>

                            <Row className="g-3 mb-4">
                                {/* ── Status Overview ─────────────────────── */}
                                <Col xl={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6 className="card-title mb-0">Status overview</h6>
                                            <p className="card-sub-title text-muted mb-0" style={{ fontSize: 11 }}>
                                                Get a snapshot of the status of your work items.
                                            </p>
                                        </Card.Header>
                                        <Card.Body>
                                            {tasks.length === 0 ? (
                                                <div className="text-center text-muted py-4">No tasks yet</div>
                                            ) : (
                                                <ReactApexChart
                                                    type="donut"
                                                    series={statusSeries}
                                                    options={donutOptions}
                                                    height={240}
                                                />
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* ── Opportunities Pipeline ──────────────── */}
                                <Col xl={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6 className="card-title mb-0">Opportunities pipeline</h6>
                                            <p className="card-sub-title text-muted mb-0" style={{ fontSize: 11 }}>
                                                Stage-by-stage distribution across your opportunity funnel.
                                            </p>
                                        </Card.Header>
                                        <Card.Body>
                                            {opportunities.length === 0 ? (
                                                <div className="text-center text-muted py-4">No opportunities yet</div>
                                            ) : (
                                                <ReactApexChart
                                                    type="donut"
                                                    series={pipelineSeries}
                                                    options={pipelineOptions}
                                                    height={240}
                                                />
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-3 mb-4">
                                {/* ── Logistics Overview ──────────────────── */}
                                <Col xl={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6 className="card-title mb-0">Logistics overview</h6>
                                            <p className="card-sub-title text-muted mb-0" style={{ fontSize: 11 }}>
                                                Track equipment, stock, crews, vehicles, and maintenance records in one view.
                                            </p>
                                        </Card.Header>
                                        <Card.Body>
                                            {logisticsTotal === 0 ? (
                                                <div className="text-center text-muted py-4">No logistics records yet</div>
                                            ) : (
                                                <ReactApexChart
                                                    type="donut"
                                                    series={logisticsSeries}
                                                    options={logisticsOptions}
                                                    height={240}
                                                />
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* ── Recent Activity ─────────────────────── */}
                                <Col xl={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6 className="card-title mb-0">Recent activity</h6>
                                            <p className="card-sub-title text-muted mb-0" style={{ fontSize: 11 }}>
                                                Stay up to date with what's happening.
                                            </p>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            {recentTasks.length === 0 ? (
                                                <div className="text-center text-muted py-4">No recent activity</div>
                                            ) : (
                                                <div className="list-group list-group-flush">
                                                    {recentTasks.map(t => (
                                                        <div key={t.id} className="list-group-item px-3 py-2 d-flex align-items-start gap-2">
                                                            <div className={`avatar avatar-xs avatar-soft-${avatarColor(t.assignedTo)} avatar-rounded flex-shrink-0 mt-1`}>
                                                                <span className="initial-wrap" style={{ fontSize: '9px' }}>
                                                                    {(t.assignedTo || 'U').charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div className="fw-semibold text-dark" style={{ fontSize: 12, lineHeight: 1.3 }}>
                                                                    {t.assignedTo || 'Someone'}{' '}
                                                                    <span className="fw-normal text-muted">created</span>{' '}
                                                                    <span className="text-primary">{t.title}</span>
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: 10 }}>
                                                                    {timeAgo(t.createdAt)}
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                bg="light" text="dark"
                                                                className="border flex-shrink-0"
                                                                style={{ fontSize: 9, background: COLUMN_COLORS[statusToDisplay(t.status, t.done)] + '22',
                                                                         color: COLUMN_COLORS[statusToDisplay(t.status, t.done)], borderColor: COLUMN_COLORS[statusToDisplay(t.status, t.done)] + '44' }}
                                                            >
                                                                {statusToDisplay(t.status, t.done)}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-3 mb-4">
                                {/* ── Priority Breakdown ──────────────────── */}
                                <Col xl={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6 className="card-title mb-0">Priority breakdown</h6>
                                            <p className="card-sub-title text-muted mb-0" style={{ fontSize: 11 }}>
                                                Get a holistic view of how work is being prioritized.
                                            </p>
                                        </Card.Header>
                                        <Card.Body>
                                            <ReactApexChart
                                                type="bar"
                                                series={[{ name: 'Tasks', data: Object.values(priorityGroups) }]}
                                                options={priorityBarOptions}
                                                height={210}
                                            />
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* ── Category/Types of Work ──────────────── */}
                                <Col xl={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6 className="card-title mb-0">Types of work</h6>
                                            <p className="card-sub-title text-muted mb-0" style={{ fontSize: 11 }}>
                                                A breakdown of work items by their category.
                                            </p>
                                        </Card.Header>
                                        <Card.Body>
                                            {categoryGroups.length === 0 ? (
                                                <div className="text-center text-muted py-3">No data</div>
                                            ) : (
                                                <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                                                    <thead>
                                                        <tr>
                                                            <th className="text-muted fw-normal border-0" style={{ fontSize: 11 }}>Category</th>
                                                            <th className="text-muted fw-normal border-0" style={{ fontSize: 11 }}>Distribution</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {categoryGroups.map(([cat, count]) => {
                                                            const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
                                                            return (
                                                                <tr key={cat}>
                                                                    <td className="py-2 fw-semibold">{cat}</td>
                                                                    <td className="py-2" style={{ width: '60%' }}>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <ProgressBar
                                                                                now={pct}
                                                                                variant="primary"
                                                                                style={{ height: 6, flex: 1, borderRadius: 4 }}
                                                                            />
                                                                            <span className="text-muted" style={{ fontSize: 11, minWidth: 30, textAlign: 'right' }}>
                                                                                {pct}%
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* ── Team Workload ────────────────────────────── */}
                            <Row className="g-3">
                                <Col xl={12}>
                                    <Card className="card-border">
                                        <Card.Header className="card-header-action">
                                            <h6 className="card-title mb-0">Team workload</h6>
                                            <p className="card-sub-title text-muted mb-0" style={{ fontSize: 11 }}>
                                                Monitor the capacity of your team.
                                            </p>
                                        </Card.Header>
                                        <Card.Body>
                                            {teamWorkload.length === 0 ? (
                                                <div className="text-center text-muted py-3">No data</div>
                                            ) : (
                                                <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                                                    <thead>
                                                        <tr>
                                                            <th className="text-muted fw-normal border-0" style={{ fontSize: 11 }}>Assignee</th>
                                                            <th className="text-muted fw-normal border-0" style={{ fontSize: 11 }}>Work distribution</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {teamWorkload.map(([name, count]) => {
                                                            const pct = Math.round((count / maxWorkload) * 100);
                                                            return (
                                                                <tr key={name}>
                                                                    <td className="py-2">
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className={`avatar avatar-xs avatar-soft-${avatarColor(name)} avatar-rounded flex-shrink-0`}>
                                                                                <span className="initial-wrap" style={{ fontSize: '9px' }}>
                                                                                    {name.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                            <span className="fw-semibold" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-2" style={{ width: '55%' }}>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <ProgressBar
                                                                                now={pct}
                                                                                variant="info"
                                                                                style={{ height: 6, flex: 1, borderRadius: 4 }}
                                                                            />
                                                                            <span className="text-muted" style={{ fontSize: 11, minWidth: 30, textAlign: 'right' }}>
                                                                                {pct}%
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ tasks, opportunities, equipment, stockLocations, crewMembers, vehicles, maintenance }) => ({
    tasks,
    opportunities,
    equipment,
    stockLocations,
    crewMembers,
    vehicles,
    maintenance,
});
export default connect(mapStateToProps)(KanbanSummary);
