import React, { useMemo } from 'react';
import { Badge, Card, Col, Container, ProgressBar, Row, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import { Activity, AlertCircle, CheckCircle, Clock, List } from 'react-feather';

/* ── Colour maps ─────────────────────────────────────────────────────────── */
const STATUS_COLORS = {
    'To Do':        '#6e7891',
    'In Progress':  '#0065ff',
    'Review':       '#8777d9',
    'Done':         '#00875a',
    'Completed':    '#00875a',
    'On Hold':      '#adb5bd',
    'Cancelled':    '#de350b',
};

const PRIORITY_COLORS = {
    Urgent:   '#de350b',
    High:     '#ff5630',
    Medium:   '#ffab00',
    Low:      '#36b37e',
};

const statusOf = (t) => {
    if (t.done || t.status === 'Completed') return 'Done';
    return t.status || 'To Do';
};

/* ── Stat card ───────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, count, label, sub, color }) => (
    <Card className="card-border h-100">
        <Card.Body className="d-flex align-items-center gap-3 py-3">
            <div className={`avatar avatar-lg avatar-soft-${color} avatar-rounded flex-shrink-0`}>
                <span className="initial-wrap"><Icon size={20} /></span>
            </div>
            <div>
                <div className="fw-bold fs-4 lh-1">{count}</div>
                <div className="fw-semibold" style={{ fontSize: 13 }}>{label}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{sub}</div>
            </div>
        </Card.Body>
    </Card>
);

/* ══════════════════════════════════════════════════════════════════════════
   JiraReport
══════════════════════════════════════════════════════════════════════════ */
const JiraReport = ({ tasks = [] }) => {
    const now = new Date();

    /* ── Aggregations ── */
    const stats = useMemo(() => {
        const total     = tasks.length;
        const done      = tasks.filter(t => t.done || t.status === 'Completed').length;
        const inProg    = tasks.filter(t => t.status === 'In Progress' && !t.done).length;
        const overdue   = tasks.filter(t => {
            if (t.done || t.status === 'Completed') return false;
            const d = new Date(t.dueDate || t.deadline || 0);
            return d < now && !isNaN(d);
        }).length;
        const dueSoon   = tasks.filter(t => {
            if (t.done || t.status === 'Completed') return false;
            const d = new Date(t.dueDate || t.deadline || 0);
            const diff = Math.ceil((d - now) / 86400000);
            return diff >= 0 && diff <= 3;
        }).length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        return { total, done, inProg, overdue, dueSoon, pct };
    }, [tasks]);

    /* ── Status donut ── */
    const statusGroups = useMemo(() => {
        const g = {};
        tasks.forEach(t => { const s = statusOf(t); g[s] = (g[s] || 0) + 1; });
        return g;
    }, [tasks]);
    const statusLabels  = Object.keys(statusGroups);
    const statusSeries  = statusLabels.map(k => statusGroups[k]);
    const statusColors  = statusLabels.map(k => STATUS_COLORS[k] || '#adb5bd');

    const donutOpts = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: statusLabels,
        colors: statusColors,
        legend: { position: 'right', fontSize: '12px' },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '68%', labels: {
            show: true,
            total: { show: true, label: 'Total Tasks', fontSize: '11px', formatter: () => String(tasks.length) },
        } } } },
        tooltip: { y: { formatter: v => `${v} tasks` } },
    };

    /* ── Priority bar chart ── */
    const priorityGroups = useMemo(() => {
        const g = {};
        tasks.forEach(t => { const p = t.priority || 'Low'; g[p] = (g[p] || 0) + 1; });
        return g;
    }, [tasks]);
    const prioLabels = ['Urgent', 'High', 'Medium', 'Low'].filter(p => priorityGroups[p]);
    const prioSeries = [{ name: 'Tasks', data: prioLabels.map(p => priorityGroups[p] || 0) }];
    const prioColors = prioLabels.map(p => PRIORITY_COLORS[p] || '#adb5bd');

    const barOpts = {
        chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true } },
        colors: prioColors,
        legend: { show: false },
        dataLabels: { enabled: true },
        xaxis: { categories: prioLabels, labels: { style: { fontSize: '12px' } } },
        tooltip: { y: { formatter: v => `${v} tasks` } },
    };

    /* ── Assignee breakdown ── */
    const assigneeGroups = useMemo(() => {
        const g = {};
        tasks.forEach(t => {
            const name = t.assignedTo || t.assignee || 'Unassigned';
            if (!g[name]) g[name] = { total: 0, done: 0, inProgress: 0 };
            g[name].total++;
            if (t.done || t.status === 'Completed') g[name].done++;
            else if (t.status === 'In Progress') g[name].inProgress++;
        });
        return Object.entries(g).sort((a, b) => b[1].total - a[1].total).slice(0, 10);
    }, [tasks]);

    /* ── Overdue tasks list ── */
    const overdueTasks = useMemo(() =>
        tasks
            .filter(t => {
                if (t.done || t.status === 'Completed') return false;
                const d = new Date(t.dueDate || t.deadline || 0);
                return d < now && !isNaN(d);
            })
            .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
            .slice(0, 8),
        [tasks]
    );

    const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

    return (
        <Container fluid className="py-4 px-4">
            <div className="d-flex align-items-center gap-2 mb-4">
                <List size={22} className="text-primary" />
                <div>
                    <h4 className="mb-0 fw-bold">Jira Report</h4>
                    <div className="text-muted fs-7">Task breakdown and team workload</div>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <Row className="g-3 mb-4">
                <Col xs={6} md={3}><StatCard icon={Activity}     count={stats.total}   label="Total Tasks"   sub="All tasks"              color="primary"  /></Col>
                <Col xs={6} md={3}><StatCard icon={CheckCircle}  count={stats.done}    label="Completed"     sub={`${stats.pct}% done`}   color="success"  /></Col>
                <Col xs={6} md={3}><StatCard icon={Clock}        count={stats.inProg}  label="In Progress"   sub="Active tasks"            color="warning"  /></Col>
                <Col xs={6} md={3}><StatCard icon={AlertCircle}  count={stats.overdue} label="Overdue"       sub="Need attention"          color="danger"   /></Col>
            </Row>

            {/* ── Completion bar ── */}
            <Card className="card-border mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold fs-7">Overall Completion</span>
                        <span className="fw-bold text-primary">{stats.pct}%</span>
                    </div>
                    <ProgressBar now={stats.pct} variant="primary" style={{ height: 10, borderRadius: 6 }} />
                    <div className="d-flex gap-4 mt-2 fs-7 text-muted">
                        <span>{stats.done} done</span>
                        <span>{stats.total - stats.done} remaining</span>
                        <span>{stats.dueSoon} due within 3 days</span>
                    </div>
                </Card.Body>
            </Card>

            {/* ── Charts row ── */}
            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7">Tasks by Status</Card.Header>
                        <Card.Body>
                            {statusLabels.length === 0
                                ? <div className="text-center text-muted py-4">No data</div>
                                : <ReactApexChart options={donutOpts} series={statusSeries} type="donut" height={280} />
                            }
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7">Tasks by Priority</Card.Header>
                        <Card.Body>
                            {prioLabels.length === 0
                                ? <div className="text-center text-muted py-4">No data</div>
                                : <ReactApexChart options={barOpts} series={prioSeries} type="bar" height={280} />
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Assignee table + Overdue list ── */}
            <Row className="g-3">
                <Col md={7}>
                    <Card className="card-border">
                        <Card.Header className="py-3 fw-semibold fs-7">Team Workload</Card.Header>
                        <Card.Body className="p-0">
                            {assigneeGroups.length === 0
                                ? <div className="text-center text-muted py-4">No assignees yet</div>
                                : (
                                    <Table hover className="mb-0 align-middle" style={{ fontSize: 12 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>Assignee</th>
                                                <th className="text-center">Total</th>
                                                <th className="text-center">Done</th>
                                                <th className="text-center">In Progress</th>
                                                <th style={{ width: 120 }}>Completion</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assigneeGroups.map(([name, g]) => (
                                                <tr key={name}>
                                                    <td className="fw-medium">{name}</td>
                                                    <td className="text-center">{g.total}</td>
                                                    <td className="text-center">
                                                        <Badge bg="success" className="fw-normal">{g.done}</Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg="warning" className="fw-normal">{g.inProgress}</Badge>
                                                    </td>
                                                    <td>
                                                        <ProgressBar
                                                            now={g.total ? Math.round((g.done / g.total) * 100) : 0}
                                                            variant="success"
                                                            style={{ height: 6 }}
                                                            label={`${g.total ? Math.round((g.done / g.total) * 100) : 0}%`}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )
                            }
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7 text-danger">
                            <AlertCircle size={14} className="me-1" /> Overdue Tasks ({overdueTasks.length})
                        </Card.Header>
                        <Card.Body className="p-0">
                            {overdueTasks.length === 0
                                ? <div className="text-center text-muted py-4"><CheckCircle size={28} className="mb-2 d-block mx-auto text-success" />All tasks are on track!</div>
                                : (
                                    <Table hover className="mb-0 align-middle" style={{ fontSize: 12 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>Task</th>
                                                <th>Priority</th>
                                                <th>Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overdueTasks.map(t => (
                                                <tr key={t.id}>
                                                    <td className="text-truncate" style={{ maxWidth: 180 }}>{t.title || 'Untitled'}</td>
                                                    <td>
                                                        <Badge
                                                            style={{ background: PRIORITY_COLORS[t.priority] || '#adb5bd', fontSize: 10 }}
                                                        >
                                                            {t.priority || 'Low'}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-danger">{fmtDate(t.dueDate || t.deadline)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

const mapState = ({ tasks }) => ({ tasks: tasks || [] });
export default connect(mapState)(JiraReport);
