import React, { useState, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { PALETTE, STATUS_COLORS, DEL_STATUS_COLORS, getCity, getPrimaryLead, fmtBudget } from './eventUtils';

const CHIPS = [
    { key: 'all',       label: 'All events' },
    { key: 'completed', label: 'Completed' },
    { key: 'upcoming',  label: 'Upcoming' },
    { key: 'planned',   label: 'Planned' },
    { key: '2026',      label: '2026 only' },
];

const count = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

const Legend = ({ items }) => (
    <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
        {items.map(({ label, color, value }) => (
            <span key={label} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {label} <strong>{value}</strong>
            </span>
        ))}
    </div>
);

const ChartCard = ({ title, children }) => (
    <Card className="mb-3">
        <Card.Header className="py-2">
            <span className="fw-semibold" style={{ fontSize: 13 }}>{title}</span>
        </Card.Header>
        <Card.Body>{children}</Card.Body>
    </Card>
);

const EventsAnalytics = ({ events }) => {
    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        if (filter === 'all')  return events;
        if (filter === '2026') return events.filter(e => (e.date || '').startsWith('2026'));
        return events.filter(e => e.status === filter);
    }, [events, filter]);

    /* ── Derived data ── */
    const statusCounts = useMemo(() => {
        const m = { completed: 0, upcoming: 0, planned: 0 };
        filtered.forEach(e => { if (m[e.status] !== undefined) m[e.status]++; });
        return m;
    }, [filtered]);

    const leadCounts = useMemo(() => {
        const m = {};
        filtered.forEach(e => { const l = getPrimaryLead(e.lead); m[l] = (m[l] || 0) + 1; });
        return Object.entries(m).sort((a, b) => b[1] - a[1]);
    }, [filtered]);

    const delCategoryCounts = useMemo(() => {
        const cats = { 'AV / LED Screen': 0, 'Staging': 0, 'Branding': 0, 'Lighting': 0, 'Logistics': 0, 'Other': 0 };
        filtered.forEach(e => (e.deliverables || []).forEach(d => {
            const n = (d.name || '').toLowerCase();
            if (/led|screen|av|camera|video|switcher|monitor|projector/.test(n)) cats['AV / LED Screen']++;
            else if (/stage|truss|riser/.test(n)) cats['Staging']++;
            else if (/backdrop|banner|photo|brand|artwork|podium|flag|signage/.test(n)) cats['Branding']++;
            else if (/light|par|moving|blinder|haze|uplighter/.test(n)) cats['Lighting']++;
            else if (/transport|accommodation|crew|catering|registration/.test(n)) cats['Logistics']++;
            else cats['Other']++;
        }));
        return cats;
    }, [filtered]);

    const delStatusCounts = useMemo(() => {
        const m = { planned: 0, in_progress: 0, completed: 0 };
        filtered.forEach(e => (e.deliverables || []).forEach(d => { if (m[d.status] !== undefined) m[d.status]++; }));
        return m;
    }, [filtered]);

    const monthDist = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) =>
            new Date(2000, i, 1).toLocaleString('en', { month: 'short' }));
        const m = {};
        months.forEach(mo => (m[mo] = 0));
        filtered.forEach(e => {
            if (e.date) {
                const mo = new Date(e.date + 'T00:00:00').toLocaleString('en', { month: 'short' });
                if (m[mo] !== undefined) m[mo]++;
            }
        });
        return { labels: months, data: months.map(mo => m[mo]) };
    }, [filtered]);

    const cityCounts = useMemo(() => {
        const m = {};
        filtered.forEach(e => { const c = getCity(e.venue); m[c] = (m[c] || 0) + 1; });
        return Object.entries(m).sort((a, b) => b[1] - a[1]);
    }, [filtered]);

    const vendorCounts = useMemo(() => {
        const m = {};
        filtered.forEach(e => (e.deliverables || []).forEach(d => {
            if (d.vendor) { m[d.vendor] = (m[d.vendor] || 0) + 1; }
        }));
        return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12);
    }, [filtered]);

    const budgetByEvent = useMemo(() =>
        filtered.filter(e => e.budget > 0)
            .sort((a, b) => b.budget - a.budget)
            .slice(0, 12),
        [filtered]
    );

    const noData = (
        <div className="text-muted text-center py-4" style={{ fontSize: 12 }}>
            No data for this filter
        </div>
    );

    /* ── Chart options ── */
    const statusDonut = {
        series: [statusCounts.completed, statusCounts.upcoming, statusCounts.planned],
        options: {
            chart: { type: 'donut' },
            labels: ['Completed', 'Upcoming', 'Planned'],
            colors: ['#10b981', '#3b82f6', '#f59e0b'],
            legend: { show: false },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '65%' } } },
        },
    };

    const leadBarOpts = {
        series: [{ name: 'Events', data: leadCounts.map(([, v]) => v) }],
        options: {
            chart: { type: 'bar', toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 4, distributed: true } },
            colors: leadCounts.map((_, i) => PALETTE[i % PALETTE.length]),
            xaxis: { categories: leadCounts.map(([k]) => k), labels: { style: { fontSize: '11px' } } },
            yaxis: { tickAmount: 3 },
            legend: { show: false },
            dataLabels: { enabled: false },
            grid: { strokeDashArray: 3 },
        },
    };

    const catDonut = {
        series: Object.values(delCategoryCounts),
        options: {
            chart: { type: 'donut' },
            labels: Object.keys(delCategoryCounts),
            colors: PALETTE,
            legend: { show: false },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '65%' } } },
        },
    };

    const delStatusDonut = {
        series: [delStatusCounts.planned, delStatusCounts.in_progress, delStatusCounts.completed],
        options: {
            chart: { type: 'donut' },
            labels: ['Planned', 'In progress', 'Completed'],
            colors: ['#f59e0b', '#3b82f6', '#10b981'],
            legend: { show: false },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '65%' } } },
        },
    };

    const monthBar = {
        series: [{ name: 'Events', data: monthDist.data }],
        options: {
            chart: { type: 'bar', toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 3 } },
            colors: ['#6366f1'],
            xaxis: { categories: monthDist.labels, labels: { style: { fontSize: '10px' } } },
            yaxis: { tickAmount: 3 },
            dataLabels: { enabled: false },
            grid: { strokeDashArray: 3 },
        },
    };

    const cityDonut = {
        series: cityCounts.map(([, v]) => v),
        options: {
            chart: { type: 'donut' },
            labels: cityCounts.map(([k]) => k),
            colors: PALETTE,
            legend: { show: false },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '65%' } } },
        },
    };

    const vendorBar = {
        series: [{ name: 'Events', data: vendorCounts.map(([, v]) => v) }],
        options: {
            chart: { type: 'bar', toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 3, horizontal: true } },
            colors: ['#8b5cf6'],
            xaxis: { labels: { style: { fontSize: '10px' } } },
            yaxis: { categories: vendorCounts.map(([k]) => k), labels: { style: { fontSize: '10px' } } },
            dataLabels: { enabled: false },
            grid: { strokeDashArray: 3 },
        },
    };

    const budgetBar = {
        series: [{ name: 'Budget (GHS)', data: budgetByEvent.map(e => Number(e.budget)) }],
        options: {
            chart: { type: 'bar', toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 4, distributed: true } },
            colors: budgetByEvent.map(e =>
                e.budgetStatus === 'paid' ? '#10b981' :
                e.budgetStatus === 'approved' ? '#3b82f6' : '#f59e0b'
            ),
            xaxis: { categories: budgetByEvent.map(e => e.name.length > 18 ? e.name.slice(0, 18) + '…' : e.name), labels: { style: { fontSize: '10px' }, rotate: -30 } },
            yaxis: { labels: { formatter: v => 'GHS ' + Number(v).toLocaleString(), style: { fontSize: '10px' } } },
            legend: { show: false },
            dataLabels: { enabled: false },
            grid: { strokeDashArray: 3 },
        },
    };

    return (
        <div>
            {/* Filter chips */}
            <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>View:</span>
                {CHIPS.map(c => (
                    <button key={c.key}
                        className={`btn btn-sm ${filter === c.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ fontSize: 12 }}
                        onClick={() => setFilter(c.key)}>
                        {c.label}
                    </button>
                ))}
                <span className="ms-auto text-muted" style={{ fontSize: 11 }}>{filtered.length} events</span>
            </div>

            {/* Summary KPIs */}
            <div className="row g-2 mb-4">
                {[
                    { label: 'Total Events', value: filtered.length, color: '#6366f1' },
                    { label: 'Completed', value: statusCounts.completed, color: '#10b981' },
                    { label: 'Upcoming', value: statusCounts.upcoming, color: '#3b82f6' },
                    { label: 'Planned', value: statusCounts.planned, color: '#f59e0b' },
                    { label: 'Total Deliverables', value: count(delStatusCounts), color: '#8b5cf6' },
                    { label: 'Budget Events', value: budgetByEvent.length, color: '#14b8a6' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="col-6 col-md-2">
                        <Card className="text-center py-2" style={{ borderTop: `3px solid ${color}` }}>
                            <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>{label}</div>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                <div className="col-md-5">
                    <ChartCard title="Events by status">
                        {filtered.length > 0
                            ? <>
                                <ReactApexChart type="donut" series={statusDonut.series} options={statusDonut.options} height={220} />
                                <Legend items={[
                                    { label: 'Completed', color: '#10b981', value: statusCounts.completed },
                                    { label: 'Upcoming',  color: '#3b82f6', value: statusCounts.upcoming },
                                    { label: 'Planned',   color: '#f59e0b', value: statusCounts.planned },
                                ]} />
                            </>
                            : noData}
                    </ChartCard>
                </div>
                <div className="col-md-7">
                    <ChartCard title="Events by project lead">
                        {leadCounts.length > 0
                            ? <ReactApexChart type="bar" series={leadBarOpts.series} options={leadBarOpts.options} height={220} />
                            : noData}
                    </ChartCard>
                </div>

                <div className="col-md-5">
                    <ChartCard title="Deliverables by category">
                        {count(delCategoryCounts) > 0
                            ? <>
                                <ReactApexChart type="donut" series={catDonut.series} options={catDonut.options} height={240} />
                                <Legend items={Object.entries(delCategoryCounts).map(([k, v], i) => ({ label: k, color: PALETTE[i % PALETTE.length], value: v }))} />
                            </>
                            : noData}
                    </ChartCard>
                </div>
                <div className="col-md-7">
                    <ChartCard title="Deliverable status breakdown">
                        {count(delStatusCounts) > 0
                            ? <>
                                <ReactApexChart type="donut" series={delStatusDonut.series} options={delStatusDonut.options} height={240} />
                                <Legend items={[
                                    { label: 'Planned',     color: '#f59e0b', value: delStatusCounts.planned },
                                    { label: 'In progress', color: '#3b82f6', value: delStatusCounts.in_progress },
                                    { label: 'Completed',   color: '#10b981', value: delStatusCounts.completed },
                                ]} />
                            </>
                            : noData}
                    </ChartCard>
                </div>

                <div className="col-md-6">
                    <ChartCard title="Monthly event distribution">
                        <ReactApexChart type="bar" series={monthBar.series} options={monthBar.options} height={200} />
                    </ChartCard>
                </div>
                <div className="col-md-6">
                    <ChartCard title="Venue city split">
                        {cityCounts.length > 0
                            ? <>
                                <ReactApexChart type="donut" series={cityDonut.series} options={cityDonut.options} height={200} />
                                <Legend items={cityCounts.map(([k, v], i) => ({ label: k, color: PALETTE[i % PALETTE.length], value: v }))} />
                            </>
                            : noData}
                    </ChartCard>
                </div>

                <div className="col-12">
                    <ChartCard title="Top vendors by event involvement">
                        {vendorCounts.length > 0
                            ? <ReactApexChart type="bar" series={vendorBar.series} options={vendorBar.options} height={Math.max(200, vendorCounts.length * 24)} />
                            : noData}
                    </ChartCard>
                </div>

                <div className="col-12">
                    <ChartCard title={<>Budget by event (GHS) — <span style={{ color: '#10b981' }}>■ paid</span> <span style={{ color: '#3b82f6' }}>■ approved</span> <span style={{ color: '#f59e0b' }}>■ pending</span></>}>
                        {budgetByEvent.length > 0
                            ? <ReactApexChart type="bar" series={budgetBar.series} options={budgetBar.options} height={220} />
                            : noData}
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default EventsAnalytics;
