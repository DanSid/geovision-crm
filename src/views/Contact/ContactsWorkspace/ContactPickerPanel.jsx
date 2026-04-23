import React, { useState } from 'react';
import { Badge, Form } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { getContactInitials, getContactName } from '../../../utils/contactWorkspace';

const AVATAR_COLORS = [
    '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#0284c7', '#65a30d', '#ea580c', '#db2777',
];

const avatarColor = (id) => AVATAR_COLORS[(String(id || '').charCodeAt(0) || 0) % AVATAR_COLORS.length];

const ContactPickerPanel = ({ contacts = [], selectedId, onSelect }) => {
    const [search, setSearch] = useState('');

    const filtered = contacts.filter(c => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            getContactName(c).toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.company || '').toLowerCase().includes(q)
        );
    });

    return (
        <div
            className="d-flex flex-column border-end bg-body"
            style={{ width: 260, minWidth: 260, maxWidth: 260, height: '100%' }}
        >
            {/* Header */}
            <div className="px-3 py-2 border-bottom bg-body-secondary">
                <div className="fw-semibold fs-7 text-muted mb-2">
                    {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                </div>
                <Form.Control
                    size="sm"
                    placeholder="Search contacts…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Contact rows */}
            <SimpleBar style={{ flex: 1, overflowY: 'auto' }}>
                {filtered.length === 0 && (
                    <div className="text-center text-muted py-5 fs-7">No contacts found</div>
                )}
                {filtered.map(contact => {
                    const id = contact.id || contact._id;
                    const isSelected = String(id) === String(selectedId);
                    const name = getContactName(contact);
                    const initials = getContactInitials(contact);

                    return (
                        <div
                            key={id}
                            onClick={() => onSelect(contact)}
                            style={{
                                cursor: 'pointer',
                                // Semi-transparent so it adapts to both light AND dark mode
                                background: isSelected
                                    ? 'rgba(79, 70, 229, 0.14)'
                                    : 'transparent',
                                borderLeft: isSelected
                                    ? '3px solid var(--bs-primary, #4f46e5)'
                                    : '3px solid transparent',
                                transition: 'background 0.12s',
                            }}
                            className="d-flex align-items-center gap-2 px-3 py-2 border-bottom"
                        >
                            {/* Avatar */}
                            <div
                                className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                                style={{
                                    width: 34,
                                    height: 34,
                                    minWidth: 34,
                                    borderRadius: '50%',
                                    fontSize: 11,
                                    background: isSelected ? 'var(--bs-primary, #4f46e5)' : avatarColor(id),
                                    overflow: 'hidden',
                                }}
                            >
                                {contact.photo
                                    ? <img src={contact.photo} alt="" style={{ width: 34, height: 34, objectFit: 'cover' }} />
                                    : initials}
                            </div>

                            {/* Info */}
                            <div style={{ minWidth: 0 }}>
                                {/* Name — always uses body colour so it's readable in dark & light mode */}
                                <div
                                    className="text-truncate"
                                    style={{
                                        fontSize: 13,
                                        fontWeight: isSelected ? 600 : 500,
                                        color: isSelected
                                            ? 'var(--bs-primary, #4f46e5)'
                                            : 'var(--bs-body-color)',
                                    }}
                                >
                                    {name}
                                </div>
                                {/* Company / email — use an explicit muted-text variable that works in both modes */}
                                <div
                                    className="text-truncate"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--bs-secondary-color, #6c757d)',
                                    }}
                                >
                                    {contact.company || contact.email || '—'}
                                </div>
                            </div>

                            {/* Active dot */}
                            {isSelected && (
                                <div
                                    className="ms-auto flex-shrink-0"
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: 'var(--bs-primary, #4f46e5)',
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </SimpleBar>
        </div>
    );
};

export default ContactPickerPanel;
