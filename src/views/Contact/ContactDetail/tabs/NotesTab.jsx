import React, { useState } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import { Plus, Trash2 } from 'react-feather';
import { connect } from 'react-redux';
import { addNoteWithHistory, deleteNote } from '../../../../redux/action/Crm';

const NotesTab = ({ entityType, entityId, notes, addNoteWithHistory, deleteNote }) => {
    const [show, setShow] = useState(false);
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const myNotes = notes
        .filter(n => n.entityType === entityType && String(n.entityId) === String(entityId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const fmt = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const handleSave = () => {
        if (!text.trim()) { setError('Note cannot be empty'); return; }
        addNoteWithHistory({ entityType, entityId, text: text.trim() });
        setText('');
        setError('');
        setShow(false);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">{myNotes.length} note{myNotes.length !== 1 ? 's' : ''}</h6>
                <Button size="sm" variant="primary" onClick={() => setShow(true)}>
                    <Plus size={14} className="me-1" />Add Note
                </Button>
            </div>

            {myNotes.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="mb-2">No notes yet.</p>
                    <Button size="sm" variant="outline-primary" onClick={() => setShow(true)}>Add first note</Button>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {myNotes.map(n => (
                        <Card key={n.id} className="border shadow-none">
                            <Card.Body className="py-2 px-3">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="mb-1 fs-7" style={{ whiteSpace: 'pre-wrap' }}>{n.text}</p>
                                        <small className="text-muted">{fmt(n.createdAt)}</small>
                                    </div>
                                    <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded p-1 ms-2"
                                        onClick={() => deleteNote(n.id)}>
                                        <Trash2 size={13} />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}

            <Modal show={show} onHide={() => { setShow(false); setText(''); setError(''); }}>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">Add Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        value={text}
                        onChange={e => { setText(e.target.value); setError(''); }}
                        placeholder="Write your note here..."
                        isInvalid={!!error}
                    />
                    {error && <div className="invalid-feedback d-block">{error}</div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => { setShow(false); setText(''); setError(''); }}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>Save Note</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ notes }) => ({ notes });
export default connect(mapStateToProps, { addNoteWithHistory, deleteNote })(NotesTab);
