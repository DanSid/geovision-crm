import React, { useMemo } from 'react';
import { Card, Badge, ProgressBar } from 'react-bootstrap';
import { PALETTE, STATUS_BADGE, STATUS_LABELS, delPct } from './eventUtils';

const ROLE_MAP = {
    'Femi':      { role: 'Senior Project Lead', avatar: 'FO' },
    'Ellis':     { role: 'Project Lead',         avatar: 'EA' },
    'Peter':     { role: 'Project Lead',         avatar: 'PM' },
    'Prince':    { role: 'Project Lead',         avatar: 'PE' },
    'Gideon':    { role: 'Production Supervisor', avatar: 'GK' },
    'Mustapha':  { role: 'Production Supervisor', avatar: 'MA' },
    'Kelvin':    { role: 'Project Lead',         avatar: 'KA' },
    'Edmund':    { role: 'Project Lead',         avatar: 'RE' },
    'Boatemaa':  { role: 'Event Coordinator',   avatar: 'BA' },
    'AJ':        { role: 'Event Coordinator',   avatar: 'AJ' },
    'Sandra':    { role: 'Event Coordinator',   avatar: 'SA' },
    'Shamsia':   { role: 'Event Coordinator',   avatar: 'SH' },
    'Owura':     { role: 'Production Crew',      avatar: 'OB' },
    'Biney':     { role: 'Production Crew',      avatar: 'BI' },
    'Genevive':  { role: 'Event Coordinator',   avatar: 'GE' },
    'Emma':      { role: 'Production Crew',      avatar: 'EM' },
    'Nina':      { role: 'Production Crew',      avatar: 'NI' },
};

const EventsTeam = ({ events }) => {
    /* Derive team from actual event data */
    const members = useMemo(() => {
        const map = {};

        events.forEach(e => {
            // Get all names from `team` and `lead` fields
            const names = [
                ...(e.lead || '').split('/').map(s => s.trim()),
                ...(e.team || '').split(',').map(s => s.trim()),
            ].filter(Boolean);

            names.forEach(name => {
                const cleanName = name.replace(/Rev\.\s*/i, '').trim();
                if (!cleanName) return;
                if (!map[cleanName]) {
                    map[cleanName] = {
                        name: cleanName,
                        events: [],
                        leadEvents: [],
                        ...( ROLE_MAP[cleanName] || { role: 'Team Member', avatar: cleanName.slice(0, 2).toUpperCase() }),
                    };
                }
                if ((e.lead || '').includes(name)) {
                    map[cleanName].leadEvents.push(e);
                }
                if (!map[cleanName].events.find(ev => ev.id === e.id)) {
                    map[cleanName].events.push(e);
                }
            });
        });

        return Object.values(map).sort((a, b) => b.events.length - a.events.length);
    }, [events]);

    if (!members.length) {
        return (
            <div className="text-center py-5 text-muted">
                <div style={{ fontSize: 40, opacity: 0.2 }}>👥</div>
                <p>No team data yet. Add events with team members to see them here.</p>
            </div>
        );
    }

    return (
        <div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
                Project leads, supervisors and production crew — derived from event assignments.
            </p>

            <div className="row g-3">
                {members.map((m, idx) => {
                    const color = PALETTE[idx % PALETTE.length];
                    const completedEvents = m.events.filter(e => e.status === 'completed').length;
                    const pct = m.events.length ? Math.round(completedEvents / m.events.length * 100) : 0;

                    return (
                        <div key={m.name} className="col-sm-6 col-md-4 col-lg-3">
                            <Card className="h-100" style={{ borderTop: `3px solid ${color}` }}>
                                <Card.Body>
                                    {/* Avatar + name */}
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            background: color, color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: 13, flexShrink: 0,
                                        }}>
                                            {m.avatar}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                                            <div style={{ fontSize: 11, color: '#6b7280' }}>{m.role}</div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="d-flex gap-3 mb-3" style={{ fontSize: 12 }}>
                                        <div className="text-center">
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>{m.events.length}</div>
                                            <div style={{ fontSize: 10, color: '#9ca3af' }}>Events</div>
                                        </div>
                                        <div className="text-center">
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>{m.leadEvents.length}</div>
                                            <div style={{ fontSize: 10, color: '#9ca3af' }}>As Lead</div>
                                        </div>
                                        <div className="text-center">
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>{completedEvents}</div>
                                            <div style={{ fontSize: 10, color: '#9ca3af' }}>Done</div>
                                        </div>
                                    </div>

                                    {/* Completion bar */}
                                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>{pct}% completion rate</div>
                                    <ProgressBar now={pct} style={{ height: 4, marginBottom: 10 }} variant={pct >= 80 ? 'success' : pct >= 50 ? 'primary' : 'warning'} />

                                    {/* Recent events */}
                                    <div style={{ fontSize: 11 }}>
                                        {m.events.slice(0, 3).map(e => (
                                            <div key={e.id} className="d-flex justify-content-between align-items-center mb-1">
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', color: '#374151' }} title={e.name}>
                                                    {e.name}
                                                </span>
                                                <Badge bg={STATUS_BADGE[e.status]} style={{ fontSize: 9 }}>
                                                    {STATUS_LABELS[e.status]}
                                                </Badge>
                                            </div>
                                        ))}
                                        {m.events.length > 3 && (
                                            <div style={{ fontSize: 10, color: '#9ca3af' }}>+{m.events.length - 3} more events</div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EventsTeam;
