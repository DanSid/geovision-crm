import React, { useMemo } from 'react';
import { Badge, Card, Col, Container, ProgressBar, Row, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import { AlertCircle, CheckCircle, DollarSign, FileText, TrendingUp } from 'react-feather';

/* ── Status config ───────────────────────────────────────────────────────── */
const STATUS_COLORS = {
    paid:     '#198754',
    sent:     '#0dcaf0',
    unpaid:   '#dc3545',
    draft:    '#6c757d',
    archived: '#fd7e14',
};
const STATUS_BG = {
    paid:     'success',
    sent:     'info',
    unpaid:   'danger',
    draft:    'secondary',
    archived: 'warning',
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

const fmtMoney = (val, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(val || 0);

const fmtDate = iso =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

/* ══════════════════════════════════════════════════════════════════════════
   FinanceReport
══════════════════════════════════════════════════════════════════════════ */
const FinanceReport = ({ invoices = [] }) => {
    const now = new Date();

    /* ── Key aggregations ── */
    const stats = useMemo(() => {
        const paid     = invoices.filter(i => i.status === 'paid');
        const unpaid   = invoices.filter(i => i.status === 'unpaid');
        const sent     = invoices.filter(i => i.status === 'sent');
        const draft    = invoices.filter(i => i.status === 'draft' || !i.status);
        const overdue  = invoices.filter(i => {
            if (i.status === 'paid' || i.status === 'archived') return false;
            const d = new Date(i.dueDate || i.date || 0);
            return d < now && !isNaN(d);
        });

        const totalRevenue  = paid.reduce((s, i) => s + Number(i.grossTotal || 0), 0);
        const pendingAmount = [...unpaid, ...sent].reduce((s, i) => s + Number(i.grossTotal || 0), 0);
        const collectionPct = (invoices.length - draft.length) > 0
            ? Math.round((paid.length / (invoices.length - draft.length)) * 100)
            : 0;

        return { total: invoices.length, paid, unpaid, sent, draft, overdue, totalRevenue, pendingAmount, collectionPct };
    }, [invoices]);

    /* ── Status donut ── */
    const statusGroups = useMemo(() => {
        const g = {};
        invoices.forEach(i => { const s = i.status || 'draft'; g[s] = (g[s] || 0) + 1; });
        return g;
    }, [invoices]);
    const statusLabels  = Object.keys(statusGroups);
    const statusSeries  = statusLabels.map(k => statusGroups[k]);
    const statusColours = statusLabels.map(k => STATUS_COLORS[k] || '#adb5bd');

    const donutOpts = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        colors: statusColours,
        legend: { position: 'right', fontSize: '12px' },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '68%', labels: {
            show: true,
            total: { show: true, label: 'Total Invoices', fontSize: '11px', formatter: () => String(invoices.length) },
        } } } },
        tooltip: { y: { formatter: v => `${v} invoices` } },
    };

    /* ── Monthly revenue (last 6 months) ── */
    const monthlyData = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                revenue: invoices
                    .filter(inv => inv.status === 'paid' && inv.date)
                    .filter(inv => {
                        const id = new Date(inv.date);
                        return id.getFullYear() === d.getFullYear() && id.getMonth() === d.getMonth();
                    })
                    .reduce((s, inv) => s + Number(inv.grossTotal || 0), 0),
            });
        }
        return months;
    }, [invoices]);

    const revenueBarOpts = {
        chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        colors: ['#4c6fff'],
        dataLabels: { enabled: false },
        xaxis: { categories: monthlyData.map(m => m.label), labels: { style: { fontSize: '11px' } } },
        yaxis: { labels: { formatter: v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}` } },
        tooltip: { y: { formatter: v => fmtMoney(v) } },
    };
    const revenueSeries = [{ name: 'Revenue', data: monthlyData.map(m => m.revenue) }];

    /* ── Recent invoices ── */
    const recentInvoices = useMemo(() =>
        [...invoices]
            .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
            .slice(0, 8),
        [invoices]
    );

    /* ── Overdue invoices ── */
    const overdueInvoices = useMemo(() =>
        invoices
            .filter(i => {
                if (i.status === 'paid' || i.status === 'archived') return false;
                const d = new Date(i.dueDate || i.date || 0);
                return d < now && !isNaN(d);
            })
            .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
            .slice(0, 6),
        [invoices]
    );

    return (
        <Container fluid className="py-4 px-4">
            <div className="d-flex align-items-center gap-2 mb-4">
                <DollarSign size={22} className="text-success" />
                <div>
                    <h4 className="mb-0 fw-bold">Finance Report</h4>
                    <div className="text-muted fs-7">Invoice breakdown, revenue and collections overview</div>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <Row className="g-3 mb-4">
                <Col xs={6} md={3}>
                    <StatCard icon={FileText}   count={stats.total}                   label="Total Invoices"    sub="All time"            color="primary" />
                </Col>
                <Col xs={6} md={3}>
                    <StatCard icon={CheckCircle} count={fmtMoney(stats.totalRevenue)}  label="Revenue Collected" sub="From paid invoices"   color="success" />
                </Col>
                <Col xs={6} md={3}>
                    <StatCard icon={TrendingUp}  count={fmtMoney(stats.pendingAmount)} label="Pending Amount"    sub="Sent + unpaid"       color="warning" />
                </Col>
                <Col xs={6} md={3}>
                    <StatCard icon={AlertCircle} count={stats.overdue.length}          label="Overdue Invoices"  sub="Need follow-up"      color="danger"  />
                </Col>
            </Row>

            {/* ── Collection rate bar ── */}
            <Card className="card-border mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold fs-7">Collection Rate</span>
                        <span className="fw-bold text-success">{stats.collectionPct}%</span>
                    </div>
                    <ProgressBar now={stats.collectionPct} variant="success" style={{ height: 10, borderRadius: 6 }} />
                    <div className="d-flex gap-4 mt-2 fs-7 text-muted">
                        <span className="text-success">{stats.paid.length} paid</span>
                        <span className="text-danger">{stats.unpaid.length} unpaid</span>
                        <span className="text-info">{stats.sent.length} sent</span>
                        <span className="text-secondary">{stats.draft.length} draft</span>
                    </div>
                </Card.Body>
            </Card>

            {/* ── Charts row ── */}
            <Row className="g-3 mb-4">
                <Col md={5}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7">Invoices by Status</Card.Header>
                        <Card.Body>
                            {statusLabels.length === 0
                                ? <div className="text-center text-muted py-4">No invoices yet</div>
                                : <ReactApexChart options={donutOpts} series={statusSeries} type="donut" height={280} />
                            }
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={7}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3 fw-semibold fs-7">Monthly Revenue (Last 6 Months)</Card.Header>
                        <Card.Body>
                            <ReactApexChart options={revenueBarOpts} series={revenueSeries} type="bar" height={280} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Recent invoices + overdue ── */}
            <Row className="g-3">
                <Col md={7}>
                    <Card className="card-border">
                        <Card.Header className="py-3 fw-semibold fs-7">Recent Invoices</Card.Header>
                        <Card.Body className="p-0">
                            {recentInvoices.length === 0
                                ? <div className="text-center text-muted py-4">No invoices yet</div>
                                : (
                                    <Table hover className="mb-0 align-middle" style={{ fontSize: 12 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>Invoice #</th>
                                                <th>Client</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentInvoices.map(inv => (
                                                <tr key={inv.id}>
                                                    <td className="fw-medium text-primary">
                                                        {inv.invoiceNo || `INV-${String(inv.id).slice(-5)}`}
                                                    </td>
                                                    <td>{inv.billedToName || '—'}</td>
                                                    <td>{fmtDate(inv.date || inv.createdAt)}</td>
                                                    <td className="fw-medium">
                                                        {fmtMoney(inv.grossTotal, inv.currency)}
                                                    </td>
                                                    <td>
                                                        <Badge bg={STATUS_BG[inv.status] || 'secondary'} style={{ fontSize: 10 }}>
                                                            {(inv.status || 'draft').toUpperCase()}
                                                        </Badge>
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
                            <AlertCircle size={14} className="me-1" /> Overdue Invoices ({overdueInvoices.length})
                        </Card.Header>
                        <Card.Body className="p-0">
                            {overdueInvoices.length === 0
                                ? (
                                    <div className="text-center text-muted py-4">
                                        <CheckCircle size={28} className="mb-2 d-block mx-auto text-success" />
                                        No overdue invoices!
                                    </div>
                                ) : (
                                    <Table hover className="mb-0 align-middle" style={{ fontSize: 12 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>Invoice</th>
                                                <th>Client</th>
                                                <th>Amount</th>
                                                <th>Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overdueInvoices.map(inv => (
                                                <tr key={inv.id}>
                                                    <td className="fw-medium text-primary">
                                                        {inv.invoiceNo || `INV-${String(inv.id).slice(-5)}`}
                                                    </td>
                                                    <td className="text-truncate" style={{ maxWidth: 100 }}>{inv.billedToName || '—'}</td>
                                                    <td>{fmtMoney(inv.grossTotal, inv.currency)}</td>
                                                    <td className="text-danger fw-medium">{fmtDate(inv.dueDate || inv.date)}</td>
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

const mapState = ({ invoices }) => ({ invoices: invoices || [] });
export default connect(mapState)(FinanceReport);
