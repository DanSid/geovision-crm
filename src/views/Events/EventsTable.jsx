import React, { useState, useMemo } from 'react';
import { Card, Badge, Form, ProgressBar } from 'react-bootstrap';
import { Edit, Eye, Download } from 'react-feather';
import { STATUS_BADGE, STATUS_LABELS, fmtDate, fmtBudget, delPct, getPrimaryLead } from './eventUtils';

const LEADS    = ['Femi', 'Ellis', 'Peter', 'Femi / Prince', 'Ellis / Mustapha', 'Rev. Edmund', 'Kelvin', 'Other'];
const STATUSES = ['completed', 'upcoming', 'planned'];
const YEARS    = ['2025', '2026', '2027'];

const EventDetail = ({ event, onEdit }) => {
    if (!event) return null;
    const pct = delPct(event.deliverables);

    return (
        <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between align-items-center py-2">
                <span className="fw-semibold" style={{ fontSize: 13 }}>{event.name}</span>
                <div className="d-flex gap-2">
                    <Badge bg={STATUS_BADGE[event.status]}>{STATUS_LABELS[event.status]}</Badge>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(event)}>
                        <Edit size={12} className="me-1" /> Edit
                    </button>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="row g-1" style={{ fontSize: 12 }}>
                            {[
                                ['Date', fmtDate(event.date)],
                                ['Setup', fmtDate(event.setup)],
                                ['End', fmtDate(event.enddate)],
                                ['Teardown', fmtDate(event.teardown)],
                                ['Venue', event.venue],
                                ['Lead', event.lead],
                                ['Client', event.client],
                                ['Contact', event.contact],
                                ['Team', event.team],
                                ['Crew', event.crew],
                                ['Transport', event.transport],
                                ['Accommodation', event.accomm === 'no' ? 'Not required' : event.accomm === 'yes' ? 'Required' : 'Arranged'],
                                ['Budget', fmtBudget(event.budget)],
                                ['Budget status', event.budgetStatus || '—'],
                            ].map(([k, v]) => v ? (
                                <div key={k} className="col-6">
                                    <span style={{ color: '#9ca3af' }}>{k}: </span>
                                    <span style={{ fontWeight: 500 }}>{v}</span>
                                </div>
                            ) : null)}
                        </div>
                        {event.notes && (
                            <div className="mt-2 p-2 rounded" style={{ background: '#f9fafb', fontSize: 12 }}>
                                <span style={{ color: '#6b7280' }}>Notes: </span>{event.notes}
                            </div>
                        )}
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                            <span className="fw-semibold">Deliverables ({(event.deliverables || []).length})</span>
                            <span style={{ color: '#6b7280' }}>{pct}% complete</span>
                        </div>
                        <ProgressBar now={pct} style={{ height: 6, marginBottom: 12 }} />
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {(event.deliverables || []).map((d, i) => (
                                <div key={i} className="d-flex justify-content-between align-items-center py-1 border-bottom" style={{ fontSize: 11 }}>
                                    <div style={{ flex: 1, paddingRight: 8 }}>{d.name}</div>
                                    <div style={{ color: '#6b7280', minWidth: 70 }}>{d.vendor}</div>
                                    <Badge bg={d.status === 'completed' ? 'success' : d.status === 'in_progress' ? 'primary' : 'warning'}
                                        style={{ fontSize: 10, minWidth: 70 }}>
                                        {d.status === 'in_progress' ? 'In progress' : d.status === 'completed' ? 'Completed' : 'Planned'}
                                    </Badge>
                                </div>
                            ))}
                            {!(event.deliverables || []).length && (
                                <div className="text-muted text-center py-2" style={{ fontSize: 12 }}>No deliverables added</div>
                            )}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

const EventsTable = ({ events, onEdit }) => {
    const [search,  setSearch]  = useState('');
    const [lead,    setLead]    = useState('');
    const [status,  setStatus]  = useState('');
    const [year,    setYear]    = useState('');
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return events.filter(e => {
            const mq = !q || e.name?.toLowerCase().includes(q) ||
                (e.venue || '').toLowerCase().includes(q) ||
                (e.client || '').toLowerCase().includes(q);
            return mq &&
                (!lead   || e.lead === lead) &&
                (!status || e.status === status) &&
                (!year   || (e.date || '').startsWith(year));
        });
    }, [events, search, lead, status, year]);

    const exportCSV = () => {
        const header = ['Name', 'Date', 'Venue', 'Lead', 'Status', 'Budget', 'Client', 'Deliverables', 'Progress%'];
        const rows = filtered.map(e => [
            e.name, e.date, e.venue, e.lead, e.status,
            e.budget || '', e.client || '',
            (e.deliverables || []).length, delPct(e.deliverables),
        ]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        a.download = 'events.csv';
        a.click();
    };

    return (
        <div>
            {/* Filter bar */}
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <Form.Control size="sm" type="search" placeholder="Search by name, venue or client…"
                    value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260, fontSize: 12 }} />
                <Form.Select size="sm" value={lead} onChange={e => setLead(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
                    <option value="">All leads</option>
                    {LEADS.map(l => <option key={l}>{l}</option>)}
                </Form.Select>
                <Form.Select size="sm" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
                    <option value="">All statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </Form.Select>
                <Form.Select size="sm" value={year} onChange={e => setYear(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
                    <option value="">All years</option>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                </Form.Select>
                <span className="ms-auto text-muted" style={{ fontSize: 11 }}>
                    {filtered.length} of {events.length} events
                </span>
                <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV}>
                    <Download size={12} className="me-1" /> Export CSV
                </button>
            </div>

            {/* Table */}
            <Card className="mb-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle" style={{ fontSize: 12 }}>
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '24%' }}>Event</th>
                                <th style={{ width: '10%' }}>Date</th>
                                <th style={{ width: '18%' }}>Venue</th>
                                <th style={{ width: '9%' }}>Lead</th>
                                <th style={{ width: '15%' }}>Progress</th>
                                <th style={{ width: '9%' }}>Budget</th>
                                <th style={{ width: '9%' }}>Status</th>
                                <th style={{ width: '6%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center text-muted py-5">
                                        {search || lead || status || year
                                            ? 'No events match your filters.'
                                            : 'No events yet. Click + New Event to add one.'}
                                    </td>
                                </tr>
                            ) : filtered.map(e => {
                                const pct = delPct(e.deliverables);
                                const isSel = selected?.id === e.id;
                                return (
                                    <tr key={e.id}
                                        style={{ cursor: 'pointer', background: isSel ? 'rgba(99,102,241,0.06)' : undefined }}
                                        onClick={() => setSelected(isSel ? null : e)}>
                                        <td style={{ fontWeight: 600 }}>{e.name}</td>
                                        <td style={{ color: '#6b7280' }}>{fmtDate(e.date)}</td>
                                        <td className="text-truncate" style={{ maxWidth: 0, color: '#6b7280' }}>
                                            {e.venue?.split(',')[0]}
                                        </td>
                                        <td>
                                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 600, fontSize: 11 }}>
                                                {getPrimaryLead(e.lead)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>
                                                {(e.deliverables || []).length} items · {pct}%
                                            </div>
                                            <ProgressBar now={pct} style={{ height: 4 }} />
                                        </td>
                                        <td style={{ color: '#6b7280' }}>{fmtBudget(e.budget)}</td>
                                        <td>
                                            <Badge bg={STATUS_BADGE[e.status]} style={{ fontSize: 10 }}>
                                                {STATUS_LABELS[e.status]}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-sm btn-icon btn-flush-secondary"
                                                    onClick={ev => { ev.stopPropagation(); onEdit(e); }} title="Edit">
                                                    <Edit size={13} />
                                                </button>
                                                <button className="btn btn-sm btn-icon btn-flush-secondary"
                                                    onClick={ev => { ev.stopPropagation(); setSelected(isSel ? null : e); }} title="View detail">
                                                    <Eye size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detail panel */}
            {selected && <EventDetail event={selected} onEdit={onEdit} />}
        </div>
    );
};

export default EventsTable;
