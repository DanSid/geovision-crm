import React, { useMemo } from 'react';
import { Card, Badge, ProgressBar } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { CalendarEvent, CircleCheck, Clock, Box } from 'tabler-icons-react';
import { STATUS_BADGE, STATUS_LABELS, STATUS_COLORS, PALETTE, fmtDate, delPct, getPrimaryLead } from './eventUtils';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <Card className="h-100" style={{ borderTop: `3px solid ${color}` }}>
        <Card.Body className="d-flex gap-3 align-items-center py-3">
            <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 44, height: 44, background: color + '18' }}>
                <Icon size={22} color={color} />
            </div>
            <div>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>
            </div>
        </Card.Body>
    </Card>
);

const EventsOverview = ({ events, onViewAll, onEventClick }) => {
    const total    = events.length;
    const comp     = events.filter(e => e.status === 'completed').length;
    const upcoming = events.filter(e => e.status === 'upcoming').length;
    const planned  = events.filter(e => e.status === 'planned').length;
    const totDels  = events.reduce((s, e) => s + (e.deliverables || []).length, 0);
    const compDels = events.reduce((s, e) => s + (e.deliverables || []).filter(d => d.status === 'completed').length, 0);

    const recent = useMemo(() =>
        [...events].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6),
        [events]
    );

    const pipeline = useMemo(() =>
        events.filter(e => e.status !== 'completed').sort((a, b) => (a.date || '').localeCompare(b.date || '')),
        [events]
    );

    /* Lead bar chart */
    const leadCounts = useMemo(() => {
        const lc = {};
        events.forEach(e => { const l = getPrimaryLead(e.lead); lc[l] = (lc[l] || 0) + 1; });
        return Object.entries(lc).sort((a, b) => b[1] - a[1]);
    }, [events]);

    const statusDonut = {
        series: [comp, upcoming, planned],
        options: {
            chart: { type: 'donut', sparkline: { enabled: false } },
            labels: ['Completed', 'Upcoming', 'Planned'],
            colors: ['#10b981', '#3b82f6', '#f59e0b'],
            legend: { show: false },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '65%' } } },
            tooltip: { y: { formatter: v => `${v} events` } },
        },
    };

    const leadBar = {
        series: [{ name: 'Events', data: leadCounts.map(([, v]) => v) }],
        options: {
            chart: { type: 'bar', toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 4, distributed: true } },
            colors: leadCounts.map((_, i) => PALETTE[i % PALETTE.length]),
            xaxis: { categories: leadCounts.map(([k]) => k), labels: { style: { fontSize: '11px' } } },
            yaxis: { tickAmount: 3, labels: { style: { fontSize: '11px' } } },
            legend: { show: false },
            dataLabels: { enabled: false },
            tooltip: { y: { formatter: v => `${v} events` } },
            grid: { strokeDashArray: 3 },
        },
    };

    if (!total) {
        return (
            <div className="text-center py-5 text-muted">
                <CalendarEvent size={40} className="mb-2 opacity-25" />
                <p>No events yet. Click <strong>+ New Event</strong> to get started.</p>
            </div>
        );
    }

    return (
        <div>
            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <StatCard icon={CalendarEvent} label="Total Events" value={total} sub="2025–2026 portfolio" color="#6366f1" />
                </div>
                <div className="col-6 col-md-3">
                    <StatCard icon={CircleCheck} label="Completed" value={comp}
                        sub={`↑ ${total ? Math.round(comp / total * 100) : 0}% completion rate`} color="#10b981" />
                </div>
                <div className="col-6 col-md-3">
                    <StatCard icon={Clock} label="In Pipeline" value={upcoming + planned}
                        sub={`${upcoming} upcoming · ${planned} planned`} color="#f59e0b" />
                </div>
                <div className="col-6 col-md-3">
                    <StatCard icon={Box} label="Deliverables" value={totDels}
                        sub={`${totDels ? Math.round(compDels / totDels * 100) : 0}% complete`} color="#3b82f6" />
                </div>
            </div>

            {/* Recent Events + Pipeline */}
            <div className="row g-3 mb-4">
                <div className="col-md-7">
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center py-2">
                            <span className="fw-semibold" style={{ fontSize: 13 }}>Recent Events</span>
                            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: 11 }} onClick={onViewAll}>
                                View all →
                            </button>
                        </Card.Header>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0" style={{ fontSize: 12 }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>Event</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map(e => (
                                        <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => onEventClick(e)}>
                                            <td style={{ fontWeight: 600 }}>{e.name}</td>
                                            <td style={{ color: '#6b7280' }}>{fmtDate(e.date)}</td>
                                            <td>
                                                <Badge bg={STATUS_BADGE[e.status]} style={{ fontSize: 10 }}>
                                                    {STATUS_LABELS[e.status]}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="col-md-5">
                    <Card className="h-100">
                        <Card.Header className="py-2">
                            <span className="fw-semibold" style={{ fontSize: 13 }}>Pipeline</span>
                        </Card.Header>
                        <Card.Body style={{ overflowY: 'auto', maxHeight: 280 }}>
                            {pipeline.length === 0 ? (
                                <div className="text-center text-muted py-3" style={{ fontSize: 12 }}>
                                    All clear — no upcoming events in queue
                                </div>
                            ) : pipeline.map(e => {
                                const pct = delPct(e.deliverables);
                                return (
                                    <div key={e.id} className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</span>
                                            <Badge bg={STATUS_BADGE[e.status]} style={{ fontSize: 10 }}>
                                                {STATUS_LABELS[e.status]}
                                            </Badge>
                                        </div>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                                            {e.venue?.split(',')[0]} · {e.lead}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                                            {fmtDate(e.date)} · {(e.deliverables || []).length} items · {pct}%
                                        </div>
                                        <ProgressBar now={pct} style={{ height: 4 }} variant="primary" />
                                    </div>
                                );
                            })}
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Charts */}
            <div className="row g-3">
                <div className="col-md-5">
                    <Card>
                        <Card.Header className="py-2">
                            <span className="fw-semibold" style={{ fontSize: 13 }}>Events by Status</span>
                        </Card.Header>
                        <Card.Body>
                            <ReactApexChart type="donut" series={statusDonut.series} options={statusDonut.options} height={200} />
                            <div className="d-flex flex-wrap gap-3 justify-content-center mt-2">
                                {['Completed', 'Upcoming', 'Planned'].map((l, i) => {
                                    const cols = ['#10b981', '#3b82f6', '#f59e0b'];
                                    const vals = [comp, upcoming, planned];
                                    return (
                                        <span key={l} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: cols[i], display: 'inline-block' }} />
                                            {l} <strong>{vals[i]}</strong>
                                        </span>
                                    );
                                })}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-7">
                    <Card>
                        <Card.Header className="py-2">
                            <span className="fw-semibold" style={{ fontSize: 13 }}>Events by Lead</span>
                        </Card.Header>
                        <Card.Body>
                            {leadCounts.length > 0
                                ? <ReactApexChart type="bar" series={leadBar.series} options={leadBar.options} height={200} />
                                : <div className="text-muted text-center py-4" style={{ fontSize: 12 }}>No lead data yet</div>
                            }
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EventsOverview;
