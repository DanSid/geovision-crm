import React, { useMemo, useState } from 'react';
import { Card, Badge, Form } from 'react-bootstrap';
import { PALETTE } from './eventUtils';

const SPECIALTIES = [
    'LED Screen / AV',
    'Sound System',
    'Staging',
    'Branding / Print',
    'Lighting',
    'Registration',
    'Photography / Video',
    'Decor / Drape',
    'Furniture',
    'Transport',
    'Other',
];

const getSpecialty = (vendor = '') => {
    const v = vendor.toLowerCase();
    if (/joe|j&j/.test(v)) return 'LED Screen / AV';
    if (/frankie|checkzs2/.test(v)) return 'Sound System';
    if (/stageup|ab|frankie/.test(v)) return 'Staging';
    if (/kudjo|jb prometal|kusi|finish point/.test(v)) return 'Branding / Print';
    if (/sampson|daniel|checkzs2/.test(v)) return 'Lighting';
    if (/wow logbook|raindolf/.test(v)) return 'Registration';
    if (/dna|edem/.test(v)) return 'Photography / Video';
    if (/anokye|event drape/.test(v)) return 'Decor / Drape';
    if (/collateral/.test(v)) return 'Furniture';
    if (/transport/.test(v)) return 'Transport';
    return 'Other';
};

const EventsVendors = ({ events }) => {
    const [search, setSearch] = useState('');
    const [specialty, setSpecialty] = useState('');

    /* Aggregate vendor data from all events' deliverables */
    const vendors = useMemo(() => {
        const map = {};
        events.forEach(e => {
            (e.deliverables || []).forEach(d => {
                if (!d.vendor) return;
                const key = d.vendor.trim();
                if (!map[key]) {
                    map[key] = {
                        name: key,
                        eventIds: new Set(),
                        items: [],
                        specialty: getSpecialty(key),
                    };
                }
                map[key].eventIds.add(e.id);
                map[key].items.push({ item: d.name, event: e.name, status: d.status });
            });
        });
        return Object.values(map).map((v, i) => ({
            ...v,
            eventCount: v.eventIds.size,
            color: PALETTE[i % PALETTE.length],
        })).sort((a, b) => b.eventCount - a.eventCount);
    }, [events]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return vendors.filter(v =>
            (!q || v.name.toLowerCase().includes(q)) &&
            (!specialty || v.specialty === specialty)
        );
    }, [vendors, search, specialty]);

    if (!vendors.length) {
        return (
            <div className="text-center py-5 text-muted">
                <div style={{ fontSize: 40, opacity: 0.2 }}>🏪</div>
                <p>No vendor data yet. Add events with deliverables to see vendors here.</p>
            </div>
        );
    }

    return (
        <div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
                All active vendor and supplier partners — aggregated from event deliverables.
            </p>

            <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
                <Form.Control size="sm" type="search" placeholder="Search vendors…"
                    value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 220, fontSize: 12 }} />
                <Form.Select size="sm" value={specialty} onChange={e => setSpecialty(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
                    <option value="">All specialties</option>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </Form.Select>
                <span className="ms-auto text-muted" style={{ fontSize: 11 }}>{filtered.length} vendors</span>
            </div>

            <div className="row g-3">
                {filtered.map(v => (
                    <div key={v.name} className="col-sm-6 col-md-4 col-lg-3">
                        <Card className="h-100" style={{ borderTop: `3px solid ${v.color}` }}>
                            <Card.Body>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{v.name}</div>
                                <Badge style={{ background: v.color, fontSize: 10, marginBottom: 8 }}>
                                    {v.specialty}
                                </Badge>
                                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                                    <strong style={{ color: '#374151' }}>{v.eventCount}</strong> event{v.eventCount !== 1 ? 's' : ''}
                                    &nbsp;·&nbsp;
                                    <strong style={{ color: '#374151' }}>{v.items.length}</strong> item{v.items.length !== 1 ? 's' : ''}
                                </div>
                                {v.items.slice(0, 3).map((item, i) => (
                                    <div key={i} style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        title={item.item}>
                                        · {item.item}
                                    </div>
                                ))}
                                {v.items.length > 3 && (
                                    <div style={{ fontSize: 10, color: '#c4b5fd' }}>+{v.items.length - 3} more</div>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventsVendors;
