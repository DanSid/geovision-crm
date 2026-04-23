import React, { useMemo, useState } from 'react';
import { Badge, Form, Table } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { ChevronDown, ChevronUp, RefreshCw } from 'react-feather';
import { getContactName } from '../../../utils/contactWorkspace';

/* ── Column definitions (matching ACT! layout) ───────────────────────────── */
const COLUMNS = [
    { key: 'company',     label: 'Company',     sortKey: 'company',     width: 160 },
    { key: '_name',       label: 'Contact',      sortKey: '_name',       width: 150 },
    { key: 'email',       label: 'E-mail',       sortKey: 'email',       width: 200 },
    { key: 'phone',       label: 'Phone',        sortKey: 'phone',       width: 130 },
    { key: 'workPhone',   label: 'Extension',    sortKey: 'workPhone',   width: 110 },
    { key: 'designation', label: 'Title',        sortKey: 'designation', width: 150 },
    { key: 'address1',    label: 'Address 1',    sortKey: 'address1',    width: 170 },
    { key: 'city',        label: 'City',         sortKey: 'city',        width: 110 },
    { key: 'state',       label: 'County',       sortKey: 'state',       width: 110 },
    { key: 'post',        label: 'Postal Code',  sortKey: 'post',        width: 110 },
];

/* ── Sort indicator icon ─────────────────────────────────────────────────── */
const SortIcon = ({ colKey, sortKey, sortDir }) => {
    if (colKey !== sortKey) return <ChevronDown size={11} style={{ opacity: 0.25 }} />;
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
};

/* ══════════════════════════════════════════════════════════════════════════
   ContactListTable
══════════════════════════════════════════════════════════════════════════ */
const ContactListTable = ({ contacts = [], selectedId, onSelect }) => {
    const [sortKey, setSortKey] = useState('company');
    const [sortDir, setSortDir] = useState('asc');
    const [search,  setSearch]  = useState('');
    const [checked, setChecked] = useState(new Set());

    /* ── Enrich contacts with computed name ── */
    const enriched = useMemo(
        () => contacts.map(c => ({ ...c, _name: getContactName(c) })),
        [contacts]
    );

    /* ── Filter ── */
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return enriched;
        return enriched.filter(c =>
            c._name.toLowerCase().includes(q) ||
            (c.company      || '').toLowerCase().includes(q) ||
            (c.email        || '').toLowerCase().includes(q) ||
            (c.phone        || '').toLowerCase().includes(q) ||
            (c.designation  || '').toLowerCase().includes(q)
        );
    }, [enriched, search]);

    /* ── Sort ── */
    const sorted = useMemo(() =>
        [...filtered].sort((a, b) => {
            const av = (a[sortKey] || '').toString().toLowerCase();
            const bv = (b[sortKey] || '').toString().toLowerCase();
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }),
        [filtered, sortKey, sortDir]
    );

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    /* ── Checkbox helpers ── */
    const toggleOne = (id, e) => {
        e.stopPropagation();
        setChecked(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (checked.size === sorted.length) setChecked(new Set());
        else setChecked(new Set(sorted.map(c => c.id || c._id)));
    };

    const allChecked = sorted.length > 0 && checked.size === sorted.length;

    /* ── Cell renderer ── */
    const cell = (value, isEmail = false, contact = null) => {
        if (!value) return <span style={{ color: 'var(--bs-secondary-color, #9ca3af)' }}>—</span>;
        if (isEmail) return (
            <a
                href={`mailto:${value}`}
                onClick={e => e.stopPropagation()}
                className="text-primary text-decoration-none"
                style={{ fontSize: 12 }}
            >
                {value}
            </a>
        );
        return <span style={{ fontSize: 12 }}>{value}</span>;
    };

    return (
        <div className="d-flex flex-column" style={{ height: '100%' }}>

            {/* ── Toolbar ── */}
            <div className="d-flex align-items-center gap-3 px-3 py-2 border-bottom bg-body-secondary flex-shrink-0">
                <button
                    className="btn btn-sm btn-icon btn-flush-secondary rounded"
                    title="Refresh"
                    onClick={() => setSearch('')}
                    style={{ padding: '4px 6px' }}
                >
                    <RefreshCw size={13} />
                </button>
                <Form.Control
                    size="sm"
                    type="search"
                    placeholder="Search contacts…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 280, fontSize: 13 }}
                />
                <span className="text-muted ms-auto" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {filtered.length} of {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                </span>
                {checked.size > 0 && (
                    <Badge bg="primary" pill>{checked.size} selected</Badge>
                )}
            </div>

            {/* ── Table ── */}
            <SimpleBar style={{ flex: 1 }}>
                <Table
                    hover
                    className="mb-0 align-middle"
                    style={{ fontSize: 12, tableLayout: 'fixed', minWidth: 1100 }}
                >
                    <thead>
                        <tr style={{ background: 'var(--bs-table-striped-bg)' }}>
                            {/* Checkbox */}
                            <th style={{ width: 40, paddingLeft: 12 }}>
                                <Form.Check
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={toggleAll}
                                />
                            </th>
                            {COLUMNS.map(col => (
                                <th
                                    key={col.key}
                                    style={{
                                        width: col.width,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        whiteSpace: 'nowrap',
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                    onClick={() => handleSort(col.sortKey)}
                                >
                                    <span className="d-flex align-items-center gap-1">
                                        {col.label}
                                        <SortIcon colKey={col.sortKey} sortKey={sortKey} sortDir={sortDir} />
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS.length + 1} className="text-center text-muted py-6">
                                    {search ? 'No contacts match your search.' : 'No contacts yet.'}
                                </td>
                            </tr>
                        ) : sorted.map(contact => {
                            const id  = contact.id || contact._id;
                            const sel = String(id) === String(selectedId);
                            return (
                                <tr
                                    key={id}
                                    onClick={() => onSelect(contact)}
                                    style={{
                                        cursor: 'pointer',
                                        background: sel
                                            ? 'rgba(79,70,229,0.07)'
                                            : undefined,
                                        borderLeft: sel
                                            ? '3px solid #4f46e5'
                                            : '3px solid transparent',
                                    }}
                                >
                                    <td style={{ paddingLeft: 12 }}>
                                        <Form.Check
                                            type="checkbox"
                                            checked={checked.has(id)}
                                            onChange={() => {}}
                                            onClick={e => toggleOne(id, e)}
                                        />
                                    </td>
                                    <td className="text-truncate" style={{ maxWidth: 160 }}>
                                        {contact.company
                                            ? <span className="text-primary fw-medium">{contact.company}</span>
                                            : <span style={{ color: '#9ca3af' }}>—</span>}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: sel ? 600 : 400, color: sel ? 'var(--bs-primary, #4f46e5)' : 'var(--bs-body-color)' }}>
                                            {contact._name}
                                        </span>
                                    </td>
                                    <td className="text-truncate" style={{ maxWidth: 200 }}>
                                        {cell(contact.email, true, contact)}
                                    </td>
                                    <td>{cell(contact.phone)}</td>
                                    <td>{cell(contact.workPhone)}</td>
                                    <td className="text-truncate">{cell(contact.designation)}</td>
                                    <td className="text-truncate">{cell(contact.address1)}</td>
                                    <td>{cell(contact.city)}</td>
                                    <td>{cell(contact.state || contact.county)}</td>
                                    <td>{cell(contact.post)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </SimpleBar>
        </div>
    );
};

export default ContactListTable;
