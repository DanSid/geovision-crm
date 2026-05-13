import React, { useState, useMemo } from 'react';
import { Card, Badge, Form } from 'react-bootstrap';
import { Printer } from 'react-feather';
import { fmtDate, delPct, STATUS_LABELS, STATUS_BADGE } from './eventUtils';

const DEL_STATUSES = [
    { value: 'planned',     label: 'Planned',     color: '#f59e0b' },
    { value: 'in_progress', label: 'In progress', color: '#3b82f6' },
    { value: 'completed',   label: 'Completed',   color: '#10b981' },
];

const delColor = (s) => DEL_STATUSES.find(d => d.value === s)?.color || '#6b7280';
const delLabel = (s) => DEL_STATUSES.find(d => d.value === s)?.label || s;

const EventsPlanning = ({ events, onUpdateEvent }) => {
    const [selectedId, setSelectedId] = useState('');
    const event = useMemo(() => events.find(e => String(e.id) === String(selectedId)), [events, selectedId]);

    const updateDelStatus = (idx, newStatus) => {
        if (!event) return;
        const updated = {
            ...event,
            deliverables: event.deliverables.map((d, i) => i === idx ? { ...d, status: newStatus } : d),
        };
        onUpdateEvent(updated);
    };

    const printChecklist = () => {
        if (!event) return;
        const pct = delPct(event.deliverables);
        const rows = (event.deliverables || []).map((d, i) => `
            <tr>
                <td style="width:22pt;text-align:center;border:0.5pt solid #e2e8f0">
                    <div style="width:9pt;height:9pt;border:1pt solid #94a3b8;margin:auto;${d.status === 'completed' ? 'background:#10b981' : ''}"></div>
                </td>
                <td style="border:0.5pt solid #e2e8f0;padding:4pt 6pt;font-size:8pt">${i + 1}. ${d.name}</td>
                <td style="border:0.5pt solid #e2e8f0;padding:4pt 6pt;font-size:8pt;color:#64748b">${d.vendor || '—'}</td>
                <td style="border:0.5pt solid #e2e8f0;padding:4pt 6pt;font-size:8pt">
                    <span style="background:${delColor(d.status)};color:#fff;padding:1pt 5pt;border-radius:3pt">${delLabel(d.status)}</span>
                </td>
            </tr>`).join('');

        const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @page { size: A4 portrait; margin: 14mm 12mm 16mm; }
  body { font-family: Arial, sans-serif; font-size: 9pt; color: #1e293b; }
  h1 { font-size: 14pt; margin: 0 0 4pt; }
  .sub { font-size: 8pt; color: #64748b; margin-bottom: 10pt; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4pt; margin-bottom: 10pt; font-size: 8pt; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f8fafc; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #475569; padding: 4pt 6pt; border: 0.5pt solid #cbd5e1; }
  .prog { height: 5pt; background: #e2e8f0; border-radius: 3pt; margin: 6pt 0; }
  .prog-fill { height: 100%; background: #6366f1; border-radius: 3pt; width: ${pct}%; }
  .footer { border-top: 0.5pt solid #e2e8f0; padding-top: 5pt; margin-top: 10pt; font-size: 7pt; color: #94a3b8; display: flex; justify-content: space-between; }
</style></head>
<body>
  <h1>${event.name}</h1>
  <div class="sub">Field Execution Checklist · Geovision Services</div>
  <div class="meta">
    <div><b>Date:</b> ${fmtDate(event.date)}</div>
    <div><b>Venue:</b> ${event.venue || '—'}</div>
    <div><b>Setup:</b> ${fmtDate(event.setup)}</div>
    <div><b>Lead:</b> ${event.lead || '—'}</div>
    <div><b>Client:</b> ${event.client || '—'}</div>
    <div><b>Transport:</b> ${event.transport || '—'}</div>
    <div><b>Team:</b> ${event.team || '—'}</div>
    <div><b>Notes:</b> ${event.notes || '—'}</div>
  </div>
  <div style="font-size:8pt;margin-bottom:4pt">Progress: <b>${pct}%</b> (${(event.deliverables||[]).filter(d=>d.status==='completed').length} of ${(event.deliverables||[]).length} items complete)</div>
  <div class="prog"><div class="prog-fill"></div></div>
  <table>
    <thead><tr><th style="width:22pt"></th><th>Item / Description</th><th style="width:22%">Vendor / Supplier</th><th style="width:18%">Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <span>Geovision Services · Event Checklist</span>
    <span>Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
  </div>
</body></html>`;

        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); }, 400);
    };

    const byStatus = (s) => (event?.deliverables || []).filter(d => d.status === s);

    return (
        <div>
            {/* Event Selector */}
            <div className="d-flex gap-2 align-items-center mb-4 flex-wrap">
                <Form.Select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                    style={{ minWidth: 280, maxWidth: 400, fontWeight: 600, fontSize: 14 }}>
                    <option value="">— Choose an event to plan —</option>
                    {events.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </Form.Select>
                {event && (
                    <button className="btn btn-sm btn-primary ms-auto" onClick={printChecklist}>
                        <Printer size={13} className="me-1" /> Print / Download Checklist
                    </button>
                )}
            </div>

            {!selectedId && (
                <div className="text-center py-5 text-muted">
                    <div style={{ fontSize: 40, opacity: 0.2 }}>📋</div>
                    <p>Select an event above to open the full planning board.</p>
                </div>
            )}

            {event && (
                <div>
                    {/* Event summary banner */}
                    <Card className="mb-4" style={{ borderLeft: '4px solid #6366f1' }}>
                        <Card.Body className="py-2">
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <div>
                                    <div className="fw-bold" style={{ fontSize: 15 }}>{event.name}</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                                        {fmtDate(event.date)} · {event.venue?.split(',')[0]} · Lead: {event.lead}
                                    </div>
                                </div>
                                <Badge bg={STATUS_BADGE[event.status]} className="ms-auto">
                                    {STATUS_LABELS[event.status]}
                                </Badge>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>
                                    {delPct(event.deliverables)}% complete
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Planning board — 3 columns */}
                    <div className="row g-3">
                        {DEL_STATUSES.map(col => (
                            <div key={col.value} className="col-md-4">
                                <Card className="h-100">
                                    <Card.Header className="d-flex align-items-center gap-2 py-2"
                                        style={{ borderTop: `3px solid ${col.color}` }}>
                                        <span className="fw-semibold" style={{ fontSize: 13 }}>{col.label}</span>
                                        <Badge style={{ background: col.color, fontSize: 11, marginLeft: 'auto' }}>
                                            {byStatus(col.value).length}
                                        </Badge>
                                    </Card.Header>
                                    <Card.Body style={{ minHeight: 120 }}>
                                        {byStatus(col.value).length === 0 ? (
                                            <div className="text-muted text-center py-3" style={{ fontSize: 12 }}>
                                                No items
                                            </div>
                                        ) : byStatus(col.value).map((d, i) => {
                                            const realIdx = (event.deliverables || []).findIndex(x => x === d);
                                            return (
                                                <div key={realIdx} className="mb-2 p-2 rounded" style={{ background: '#f9fafb', fontSize: 12 }}>
                                                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{d.name}</div>
                                                    {d.vendor && (
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                                                            {d.vendor}
                                                        </div>
                                                    )}
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        {DEL_STATUSES.filter(s => s.value !== col.value).map(s => (
                                                            <button key={s.value}
                                                                className="btn btn-outline-secondary"
                                                                style={{ fontSize: 10, padding: '1px 6px', borderColor: s.color, color: s.color }}
                                                                onClick={() => updateDelStatus(realIdx, s.value)}>
                                                                → {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Logistics summary */}
                    {(event.notes || event.transport || event.team) && (
                        <Card className="mt-3">
                            <Card.Header className="py-2">
                                <span className="fw-semibold" style={{ fontSize: 13 }}>Logistics & Briefing</span>
                            </Card.Header>
                            <Card.Body>
                                <div className="row g-2" style={{ fontSize: 12 }}>
                                    {event.transport && <div className="col-md-4"><span style={{ color: '#6b7280' }}>Transport: </span>{event.transport}</div>}
                                    {event.team && <div className="col-md-4"><span style={{ color: '#6b7280' }}>Team: </span>{event.team}</div>}
                                    {event.crew && <div className="col-md-4"><span style={{ color: '#6b7280' }}>Crew: </span>{event.crew}</div>}
                                    {event.accomm && event.accomm !== 'no' && <div className="col-md-4"><span style={{ color: '#6b7280' }}>Accommodation: </span>{event.accomm === 'yes' ? 'Required' : 'Arranged'}</div>}
                                    {event.notes && <div className="col-12"><span style={{ color: '#6b7280' }}>Notes: </span>{event.notes}</div>}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventsPlanning;
