import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { PALETTE, getPrimaryLead, fmtDate } from './eventUtils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const EventsTimeline = ({ events }) => {
    /* Find date range across all events with setup/date fields */
    const { minDate, maxDate, monthLabels } = useMemo(() => {
        const dated = events.filter(e => e.date);
        if (!dated.length) return { minDate: null, maxDate: null, monthLabels: [] };

        const all = dated.flatMap(e => [
            e.setup || e.date,
            e.teardown || e.enddate || e.date,
        ]).filter(Boolean);

        const parsed = all.map(d => new Date(d + 'T00:00:00'));
        const min = new Date(Math.min(...parsed));
        const max = new Date(Math.max(...parsed));

        // Round to month boundaries
        min.setDate(1);
        max.setMonth(max.getMonth() + 1, 0);

        // Build month labels
        const labels = [];
        const cur = new Date(min);
        while (cur <= max) {
            labels.push({ year: cur.getFullYear(), month: cur.getMonth(), label: MONTHS[cur.getMonth()] + ' ' + String(cur.getFullYear()).slice(2) });
            cur.setMonth(cur.getMonth() + 1);
        }

        return { minDate: min, maxDate: max, monthLabels: labels };
    }, [events]);

    const totalMs = maxDate && minDate ? maxDate - minDate : 1;

    const bar = (event) => {
        const start = new Date((event.setup || event.date) + 'T00:00:00');
        const end   = new Date((event.teardown || event.enddate || event.date) + 'T00:00:00');
        end.setDate(end.getDate() + 1); // inclusive
        const left = ((start - minDate) / totalMs) * 100;
        const width = Math.max(((end - start) / totalMs) * 100, 0.5);
        return { left: `${left}%`, width: `${width}%` };
    };

    const leadColor = useMemo(() => {
        const leads = [...new Set(events.map(e => getPrimaryLead(e.lead)))];
        const m = {};
        leads.forEach((l, i) => (m[l] = PALETTE[i % PALETTE.length]));
        return m;
    }, [events]);

    const sorted = useMemo(() =>
        [...events].filter(e => e.date).sort((a, b) => (a.date || '').localeCompare(b.date || '')),
        [events]
    );

    if (!sorted.length) {
        return (
            <div className="text-center py-5 text-muted">
                <div style={{ fontSize: 40, opacity: 0.2 }}>📅</div>
                <p>No events with dates to display.</p>
            </div>
        );
    }

    const colW = Math.max(60, Math.floor(900 / Math.max(monthLabels.length, 1)));
    const totalW = colW * monthLabels.length + 200; // 200 for label col

    return (
        <div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
                Gantt view — setup to teardown spans per event, colour-coded by project lead.
            </p>

            {/* Lead legend */}
            <div className="d-flex flex-wrap gap-3 mb-3">
                {Object.entries(leadColor).map(([lead, color]) => (
                    <span key={lead} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block' }} />
                        {lead}
                    </span>
                ))}
            </div>

            <Card>
                <Card.Body style={{ padding: 0, overflowX: 'auto' }}>
                    <div style={{ minWidth: totalW }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ width: 200, flexShrink: 0, padding: '8px 12px', fontWeight: 600, fontSize: 12, borderRight: '1px solid #e5e7eb' }}>Event</div>
                            <div style={{ flex: 1, display: 'flex' }}>
                                {monthLabels.map(({ label, month, year }) => (
                                    <div key={`${year}-${month}`} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#6b7280', padding: '8px 4px', borderRight: '1px solid #f3f4f6', fontWeight: 600 }}>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Event rows */}
                        {sorted.map((event, idx) => {
                            const { left, width } = bar(event);
                            const color = leadColor[getPrimaryLead(event.lead)] || '#6366f1';
                            return (
                                <div key={event.id} style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', minHeight: 40 }}>
                                    {/* Label */}
                                    <div style={{ width: 200, flexShrink: 0, padding: '10px 12px', fontSize: 11, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={event.name}>{event.name}</div>
                                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{getPrimaryLead(event.lead)}</div>
                                    </div>

                                    {/* Bar area */}
                                    <div style={{ flex: 1, position: 'relative', padding: '10px 0' }}>
                                        {/* Month grid lines */}
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                                            {monthLabels.map(({ label, month, year }) => (
                                                <div key={`${year}-${month}`} style={{ flex: 1, borderRight: '1px solid #f3f4f6' }} />
                                            ))}
                                        </div>

                                        {/* Gantt bar */}
                                        <div style={{
                                            position: 'absolute',
                                            left, width,
                                            top: '50%', transform: 'translateY(-50%)',
                                            height: 22,
                                            background: color,
                                            borderRadius: 4,
                                            opacity: 0.85,
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingLeft: 6,
                                            overflow: 'hidden',
                                        }} title={`${event.name} · ${fmtDate(event.setup || event.date)} → ${fmtDate(event.teardown || event.date)}`}>
                                            <span style={{ fontSize: 10, color: '#fff', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                                {fmtDate(event.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EventsTimeline;
