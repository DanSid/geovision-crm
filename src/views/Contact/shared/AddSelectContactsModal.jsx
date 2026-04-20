import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

/**
 * Reusable modal for picking contacts from the full list.
 * Props:
 *   show: boolean
 *   onHide: fn
 *   currentIds: array of contact IDs already associated
 *   onSelect: fn(selectedIds) — called on confirm with array of newly selected contact IDs
 *   contacts: Redux contacts array (injected)
 *   title?: string
 */
const AddSelectContactsModal = ({ show, onHide, currentIds = [], onSelect, contacts, title = 'Add Contacts' }) => {
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');

    const available = contacts.filter(c => {
        const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase();
        const email = (c.email || '').toLowerCase();
        const q = search.toLowerCase();
        return (!search || fullName.includes(q) || email.includes(q));
    });

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        onSelect(selected);
        setSelected([]);
        setSearch('');
        onHide();
    };

    const handleHide = () => {
        setSelected([]);
        setSearch('');
        onHide();
    };

    const fullName = (c) => `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Unknown';

    return (
        <Modal show={show} onHide={handleHide}>
            <Modal.Header closeButton>
                <Modal.Title as="h5">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: 420, overflowY: 'auto' }}>
                <Form.Control
                    size="sm"
                    placeholder="Search contacts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="mb-3"
                />
                {available.length === 0 ? (
                    <p className="text-muted text-center py-3 fs-7">No contacts found.</p>
                ) : (
                    available.map(c => {
                        const isAlready = currentIds.includes(c.id);
                        const isSelected = selected.includes(c.id);
                        return (
                            <div
                                key={c.id}
                                className={`d-flex align-items-center gap-2 py-2 px-2 rounded mb-1 ${isAlready ? 'opacity-50' : 'cursor-pointer'}`}
                                style={{ background: isSelected ? '#e8f0fe' : 'transparent' }}
                                onClick={() => !isAlready && toggle(c.id)}
                            >
                                <Form.Check
                                    type="checkbox"
                                    checked={isAlready || isSelected}
                                    disabled={isAlready}
                                    onChange={() => !isAlready && toggle(c.id)}
                                    onClick={e => e.stopPropagation()}
                                />
                                <div
                                    className="avatar avatar-xs avatar-rounded d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                    style={{ background: '#4f46e5', width: 28, height: 28, minWidth: 28, fontSize: 11 }}
                                >
                                    {fullName(c).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="fw-medium fs-7">{fullName(c)}</div>
                                    <div className="text-muted" style={{ fontSize: 11 }}>{c.email}{isAlready ? ' (already added)' : ''}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" size="sm" onClick={handleHide}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleConfirm} disabled={selected.length === 0}>
                    Add {selected.length > 0 ? `(${selected.length})` : ''}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const mapStateToProps = ({ contacts }) => ({ contacts });
export default connect(mapStateToProps)(AddSelectContactsModal);
