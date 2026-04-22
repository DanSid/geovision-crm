import React, { useMemo } from 'react';
import { Badge, Card, Col, Container, ProgressBar, Row, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import { AlertTriangle, CheckCircle, Package, Tool, Truck, Users } from 'react-feather';

/* ── Colour maps ─────────────────────────────────────────────────────────── */
const TYPE_COLORS  = { repair: '#dc3545', inspection: '#0d6efd', lost: '#fd7e14', inventory: '#6f42c1', request: '#198754' };
const TYPE_LABELS  = { repair: 'Repairs', inspection: 'Inspections', lost: 'Lost Equipment', inventory: 'Inventory Counts' };
const STATUS_COLORS = { Pending: '#ffc107', 'In Progress': '#0dcaf0', Completed: '#198754', Cancelled: '#adb5bd' };

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
   LogisticsReport
══════════════════════════════════════════════════════════════════════════ */
const LogisticsReport = ({
    maintenance = [],
    requests    = [],
    equipment   = [],
    vehicles    = [],
    crewMembers = [],
    stockLocations = [],
}) => {
    const now = new Date();

    /* ── Maintenance by type ── */
    const byType = useMemo(() => {
        const g = {};
        ['repair', 'inspection', 'lost', 'inventory'].forEach(t => {
            g[t] = maintenance.filter(r => r.type === t);
        });
        return g;
    }, [maintenance]);

    /* ── Maintenance by status ── */
    const byStatus = useMemo(() => {
        const g = {};
        maintenance.forEach(r => { const s = r.status || 'Pending'; g[s] = (g[s] || 0) + 1; });
        return g;
    }, [maintenance]);

    /* ── Requests by status ── */
    const reqByStatus = useMemo(() => {
        const g = {};
        requests.forEach(r => { const s = r.status || 'Pending'; g[s] = (g[s] || 0) + 1; });
        return g;
    }, [requests]);

    /* ── Overdue maintenance ── */
    const overdue = useMemo(() =>
        maintenance.filter(r => {
            if (r.status === 'Completed' || r.status === 'Cancelled') return false;
            const d = new Date(r.date || r.scheduledDate || 0);
            return d < now && !isNaN(d);
        }),
        [maintenance]
    );

    const totalMaint   = maintenance.length;
    const completedM   = maintenance.filter(r => r.status === 'Completed').length;
    const completionPct = totalMaint ? Math.round((completedM / totalMaint) * 100) : 0;

    /* ── Maintenance type donut ── */
    const typeLabels  = Object.keys(byType).filter(t => byType[t].length > 0);
    const typeSeries  = typeLabels.map(t => byType[t].length);
    const typeColours = typeLabels.map(t => TYPE_COLORS[t] || '#adb5bd');

    const typeDonutOpts = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: typeLabels.map(t => TYPE_LABELS[t] || t),
        colors: typeColours,
        legend: { position: 'right', fontSize: '12px' },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '68%', labels: {
            show: true,
            total: { show: true, label: 'Total Records', fontSize: '11px', formatter: () => String(totalMaint) },
        } } } },
        tooltip: { y: { formatter: v => `${v} records` } },
    };

    /* ── Maintenance status bar ── */
    const statusLabels  = Object.keys(byStatus);
    const statusSeries  = [{ name: 'Records', data: statusLabels.map(s => byStatus[s]) }];
    const statusColours = statusLabels.map(s => STATUS_COLORS[s] || '#adb5bd');

    const statusBarOpts = {
        chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, distributed: true } },
        colors: statusColours,
        legend: { show: false },
        dataLabels: { enabled: true },
        xaxis: { categories: statusLabels, labels: { style: { fontSize: '12px' } } },
        tooltip: { y: { formatter: v => `${v} records` } },
    };

    const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

    return (
        <Container fluid className="py-4 px-4">
            <div className="d-flex align-items-center gap-2 mb-4">
                <Tool size={22} className="text-warning" />
                <div>
                    <h4 className="mb-0 fw-bold">Logistics Report</h4>
                    <div className="text-muted fs-7">Equipment, maintenance, requests and crew overview</div>
                </div>
            </div>

            {/* ── Asset stat cards ── */}
            <Row className="g-3 mb-4">
                <Col xs={6} md={3}><StatCard icon={Package}      count={equipment.length}      label="Equipment"       sub="Total items tracked"   color="primary"  /></Col>
                <Col xs={6} md={3}><StatCard icon={Truck}        count={vehicles.length}       label="Vehicles"        sub="Fleet size"             color="info"     /></Col>
                <Col xs={6} md={3}><StatCard icon={Users}        count={crewMembers.length}    label="Crew Members"    sub="Active crew"            color="success"  /></Col>
                <Col xs={6} md={3}><StatCard icon={AlertTriangle} count={overdue.length}       label="Overdue Records" sub="Need attention"         color="danger"   /></Col>
            </Row>

            {/* ── Maintenance completion bar ── */}
            <Card className="card-border mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold fs-7">Maintenance Completion Rate</span>
                        <span className="fw-bold text-success">{completionPct}%</span>
                    </div>
                    <ProgressBar now={completionPct} variant="success" style={{ height: 10, borderRadius: 6 }} />
                    <div className="d-flex gap-4 mt-2 fs-7 text-muted">
                        <span>{completedM} completed</span>
                        <span>{totalMaint - completedM} pending / in-progress</span>
                        <span>{requests.length} total requests</span>
                        <span>{stockLocations.length} stock locations</span>
                    </div>
                </Card.Body>
            </Card>

            {/* ── Charts ── */}
            <Row className="g-3 mb-4">
                <Col md={5}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7">Maintenance by Type</Card.Header>
                        <Card.Body>
                            {typeLabels.length === 0
                                ? <div className="text-center text-muted py-4">No maintenance records</div>
                                : <ReactApexChart options={typeDonutOpts} series={typeSeries} type="donut" height={280} />
                            }
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={7}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7">Maintenance by Status</Card.Header>
                        <Card.Body>
                            {statusLabels.length === 0
                                ? <div className="text-center text-muted py-4">No maintenance records</div>
                                : <ReactApexChart options={statusBarOpts} series={statusSeries} type="bar" height={280} />
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Breakdown tables ── */}
            <Row className="g-3">
                {/* Maintenance type breakdown */}
                <Col md={6}>
                    <Card className="card-border">
                        <Card.Header className="py-3 fw-semibold fs-7">Maintenance Type Breakdown</Card.Header>
                        <Card.Body className="p-0">
                            <Table hover className="mb-0 align-middle" style={{ fontSize: 12 }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>Type</th>
                                        <th className="text-center">Total</th>
                                        <th className="text-center">Completed</th>
                                        <th className="text-center">Pending</th>
                                        <th style={{ width: 100 }}>Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['repair', 'inspection', 'lost', 'inventory'].map(t => {
                                        const recs      = byType[t] || [];
                                        const done      = recs.filter(r => r.status === 'Completed').length;
                                        const pending   = recs.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length;
                                        const pct       = recs.length ? Math.round((done / recs.length) * 100) : 0;
                                        return (
                                            <tr key={t}>
                                                <td>
                                                    <span
                                                        className="badge me-1"
                                                        style={{ background: TYPE_COLORS[t], fontSize: 10 }}
                                                    >
                                                        {TYPE_LABELS[t]}
                                                    </span>
                                                </td>
                                                <td className="text-center fw-bold">{recs.length}</td>
                                                <td className="text-center"><Badge bg="success" className="fw-normal">{done}</Badge></td>
                                                <td className="text-center"><Badge bg="warning" className="fw-normal">{pending}</Badge></td>
                                                <td>
                                                    <ProgressBar now={pct} variant="success" style={{ height: 6 }} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Overdue records */}
                <Col md={6}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7 text-danger">
                            <AlertTriangle size={14} className="me-1" /> Overdue Records ({overdue.length})
                        </Card.Header>
                        <Card.Body className="p-0">
                            {overdue.length === 0
                                ? (
                                    <div className="text-center text-muted py-4">
                                        <CheckCircle size={28} className="mb-2 d-block mx-auto text-success" />
                                        All records are on schedule!
                                    </div>
                                ) : (
                                    <Table hover className="mb-0 align-middle" style={{ fontSize: 12 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>Record</th>
                                                <th>Type</th>
                                                <th>Assigned</th>
                                                <th>Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overdue.slice(0, 8).map(r => (
                                                <tr key={r.id}>
                                                    <td className="text-truncate" style={{ maxWidth: 150 }}>{r.title || 'Untitled'}</td>
                                                    <td>
                                                        <span
                                                            className="badge"
                                                            style={{ background: TYPE_COLORS[r.type] || '#adb5bd', fontSize: 10 }}
                                                        >
                                                            {TYPE_LABELS[r.type] || r.type}
                                                        </span>
                                                    </td>
                                                    <td>{r.assignedTo || '—'}</td>
                                                    <td className="text-danger">{fmtDate(r.date || r.scheduledDate)}</td>
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

const mapState = ({ maintenance, requests, equipment, vehicles, crewMembers, stockLocations }) => ({
    maintenance:    maintenance    || [],
    requests:       requests       || [],
    equipment:      equipment      || [],
    vehicles:       vehicles       || [],
    crewMembers:    crewMembers    || [],
    stockLocations: stockLocations || [],
});
export default connect(mapState)(LogisticsReport);
