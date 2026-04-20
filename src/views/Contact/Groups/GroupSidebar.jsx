import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { Plus } from 'react-feather';
import { connect } from 'react-redux';
import { addGroup } from '../../../redux/action/Crm';

const GroupSidebar = ({ groups, contacts, selectedId, onSelect, addGroup }) => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!name.trim()) { setError('Group name is required'); return; }
        addGroup({ name: name.trim(), description: description.trim(), contactIds: [] });
        setName('');
        setDescription('');
        setError('');
        setShow(false);
    };

    return (
        <div className="d-flex flex-column h-100 border-end" style={{ width: 230, minWidth: 200 }}>
            <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                <div>
                    <div className="fw-semibold fs-7">All Groups</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{groups.length} groups</div>
                </div>
                <Button variant="primary" size="sm" className="btn-icon" onClick={() => setShow(true)}>
                    <Plus size={15} />
                </Button>
            </div>

            <SimpleBar style={{ flex: 1, overflowY: 'auto' }}>
                {groups.length === 0 ? (
                    <div className="text-center text-muted py-4 fs-7">No groups yet.</div>
                ) : (
                    <ul className="list-unstyled mb-0">
                        {groups.map(g => {
                            const count = (g.contactIds || []).length;
                            return (
                                <li
                                    key={g.id}
                                    className={`px-3 py-2 border-bottom ${String(selectedId) === String(g.id) ? 'bg-primary-light-5 fw-semibold text-primary' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onSelect(g.id)}
                                >
                                    <div className="fs-7">{g.name}</div>
                                    <div className="text-muted" style={{ fontSize: 11 }}>{count} contact{count !== 1 ? 's' : ''}</div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SimpleBar>

            <Modal show={show} onHide={() => { setShow(false); setName(''); setDescription(''); setError(''); }}>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">New Group</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fs-7">Group Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control size="sm" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                            isInvalid={!!error} placeholder="e.g. Prospects" />
                        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="fs-7">Description</Form.Label>
                        <Form.Control as="textarea" rows={3} size="sm" value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Contact records where..." />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => { setShow(false); setName(''); setDescription(''); setError(''); }}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>Save Group</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ groups, contacts }) => ({ groups, contacts });
export default connect(mapStateToProps, { addGroup })(GroupSidebar);
