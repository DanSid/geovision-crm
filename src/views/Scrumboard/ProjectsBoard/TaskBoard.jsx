import React, { useState } from 'react';
import {
    Badge, Button, Card, Col, Container, Dropdown, Form, Modal, Nav, Row, Tab
} from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Globe, Lock, MoreHorizontal, Plus } from 'react-feather';
import { connect } from 'react-redux';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import { addBoard, updateBoard, deleteBoard } from '../../../redux/action/Crm';

// Color options for board avatars
const AVATAR_COLORS = [
    'avatar-primary', 'avatar-success', 'avatar-danger', 'avatar-warning',
    'avatar-info', 'avatar-pink', 'avatar-violet', 'avatar-orange',
];

const colorForName = (name) => {
    const idx = (name || 'A').charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
};

const timeAgo = (isoStr) => {
    if (!isoStr) return '';
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
};

// Load registered users (for team tab)
const loadUsers = () => {
    try {
        const raw = localStorage.getItem('gv_crm_users');
        if (!raw) return [];
        return JSON.parse(raw).map(({ password: _p, ...u }) => u);
    } catch { return []; }
};

const emptyBoardForm = { name: '', visibility: 'public', description: '' };

const TaskBoard = ({ showSidebar, toggleSidebar, boards, addBoard, updateBoard, deleteBoard, currentUser }) => {
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [showEditBoard, setShowEditBoard] = useState(false);
    const [editingBoard, setEditingBoard] = useState(null);
    const [boardForm, setBoardForm] = useState(emptyBoardForm);
    const [boardErrors, setBoardErrors] = useState({});
    const [search, setSearch] = useState('');

    const teamMembers = loadUsers();

    const handleBoardChange = (field, val) => {
        setBoardForm(f => ({ ...f, [field]: val }));
        if (boardErrors[field]) setBoardErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    const validateBoard = () => {
        const e = {};
        if (!boardForm.name.trim()) e.name = 'Board name is required';
        return e;
    };

    const handleAddBoard = () => {
        const e = validateBoard();
        if (Object.keys(e).length) { setBoardErrors(e); return; }
        addBoard({ ...boardForm, createdBy: currentUser?.name || 'Admin' });
        setBoardForm(emptyBoardForm);
        setBoardErrors({});
        setShowAddBoard(false);
    };

    const handleEditOpen = (board) => {
        setEditingBoard(board);
        setBoardForm({ name: board.name, visibility: board.visibility || 'public', description: board.description || '' });
        setBoardErrors({});
        setShowEditBoard(true);
    };

    const handleEditSave = () => {
        const e = validateBoard();
        if (Object.keys(e).length) { setBoardErrors(e); return; }
        updateBoard({ ...editingBoard, ...boardForm });
        setShowEditBoard(false);
        setEditingBoard(null);
    };

    const handleDelete = (id) => {
        deleteBoard(id);
    };

    const filteredBoards = boards.filter(b =>
        b.name?.toLowerCase().includes(search.toLowerCase())
    );

    // Separate public and private boards
    const publicBoards = filteredBoards.filter(b => b.visibility !== 'private');
    const privateBoards = filteredBoards.filter(b => b.visibility === 'private');

    const BoardCard = ({ board }) => (
        <Col lg={6} className="mb-4">
            <Card className="board-card card-border">
                <Card.Body>
                    <div className="media align-items-center">
                        <div className="media-head me-3">
                            <div className={`avatar avatar-sm ${colorForName(board.name)}`}>
                                <span className="initial-wrap">{board.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                        <div className="media-body">
                            <div className="fw-medium">{board.name}</div>
                            {board.description && (
                                <div className="text-muted" style={{ fontSize: 11 }}>{board.description}</div>
                            )}
                        </div>
                    </div>
                </Card.Body>
                <Card.Footer className="text-muted justify-content-between">
                    <div className="d-flex align-items-center gap-1">
                        <div
                            className="avatar avatar-xs avatar-primary avatar-rounded d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: 24, height: 24, minWidth: 24, fontSize: 11 }}
                        >
                            {(board.createdBy || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="ms-1" style={{ fontSize: 11 }}>{board.createdBy}</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <p className="p-xs me-2">{timeAgo(board.createdAt)}</p>
                        <HkTooltip placement="top" title={board.visibility === 'private' ? 'Private' : 'Public'}>
                            <span className="feather-icon me-1">
                                {board.visibility === 'private' ? <Lock size={14} /> : <Globe size={14} />}
                            </span>
                        </HkTooltip>
                        <Dropdown as="div" className="d-inline">
                            <Dropdown.Toggle size="xs" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret">
                                <span className="icon">
                                    <span className="feather-icon"><MoreHorizontal /></span>
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                                <Dropdown.Item onClick={() => handleEditOpen(board)}>Edit</Dropdown.Item>
                                <Dropdown.Item className="text-danger" onClick={() => handleDelete(board.id)}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Card.Footer>
            </Card>
        </Col>
    );

    return (
        <div className="taskboardapp-content">
            <div className="taskboardapp-detail-wrap">
                <Tab.Container defaultActiveKey="tab_boards">
                    <header className="taskboard-header">
                        <Nav justify variant="tabs" className="nav-light nav-segmented-tabs active-theme mx-auto w-350p">
                            <Nav.Item>
                                <Nav.Link eventKey="tab_boards">
                                    <span className="nav-link-text">Boards</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="tab_team">
                                    <span className="nav-link-text">Team</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <div className={classNames("hk-sidebar-togglable", { "active": !showSidebar })} onClick={toggleSidebar} />
                    </header>

                    <div className="taskboard-body">
                        <SimpleBar className="nicescroll-bar">
                            <Container fluid>
                                <Row className="justify-content-center board-team-wrap">
                                    <Col md={10} sm={12}>
                                        <Tab.Content>
                                            {/* ── BOARDS TAB ── */}
                                            <Tab.Pane eventKey="tab_boards">
                                                {/* Search + Add */}
                                                <div className="d-flex align-items-center justify-content-between mb-4">
                                                    <Form.Control
                                                        size="sm"
                                                        type="search"
                                                        placeholder="Search boards..."
                                                        className="w-200p"
                                                        value={search}
                                                        onChange={e => setSearch(e.target.value)}
                                                    />
                                                    <Button variant="primary" size="sm" onClick={() => { setBoardForm(emptyBoardForm); setBoardErrors({}); setShowAddBoard(true); }}>
                                                        <Plus size={14} className="me-1" /> New Board
                                                    </Button>
                                                </div>

                                                {boards.length === 0 ? (
                                                    <div className="text-center py-5 text-muted">
                                                        <i className="ri-kanban-view fs-1 d-block mb-3" />
                                                        <h6>No boards yet</h6>
                                                        <p className="fs-7">Click "New Board" to create your first board.</p>
                                                        <Button variant="primary" size="sm" onClick={() => { setBoardForm(emptyBoardForm); setBoardErrors({}); setShowAddBoard(true); }}>
                                                            <Plus size={14} className="me-1" /> Create Board
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Public Boards */}
                                                        {publicBoards.length > 0 && (
                                                            <>
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <Globe size={15} className="me-2 text-muted" />
                                                                    <h6 className="mb-0">Public Boards ({publicBoards.length})</h6>
                                                                </div>
                                                                <Row className="mb-4">
                                                                    {publicBoards.map(b => <BoardCard key={b.id} board={b} />)}
                                                                </Row>
                                                            </>
                                                        )}

                                                        {/* Private Boards */}
                                                        {privateBoards.length > 0 && (
                                                            <>
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <Lock size={15} className="me-2 text-muted" />
                                                                    <h6 className="mb-0">Private Boards ({privateBoards.length})</h6>
                                                                </div>
                                                                <Row>
                                                                    {privateBoards.map(b => <BoardCard key={b.id} board={b} />)}
                                                                </Row>
                                                            </>
                                                        )}

                                                        {filteredBoards.length === 0 && search && (
                                                            <div className="text-center py-4 text-muted fs-7">
                                                                No boards match "{search}"
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </Tab.Pane>

                                            {/* ── TEAM TAB ── */}
                                            <Tab.Pane eventKey="tab_team">
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h5 className="mb-0">Team Members ({teamMembers.length})</h5>
                                                    <Link to="/settings" className="btn btn-sm btn-outline-primary">
                                                        Manage Users
                                                    </Link>
                                                </div>

                                                {teamMembers.length === 0 ? (
                                                    <div className="text-center py-5 text-muted">
                                                        <i className="ri-team-line fs-1 d-block mb-3" />
                                                        <h6>No team members yet</h6>
                                                        <p className="fs-7">Users who sign up will appear here.</p>
                                                        <Link to="/auth/signup" className="btn btn-sm btn-primary">Invite Member</Link>
                                                    </div>
                                                ) : (
                                                    <Row>
                                                        {teamMembers.map(u => (
                                                            <Col xl={6} md={12} key={u.id} className="mb-3">
                                                                <Card className="team-card card-border">
                                                                    <Card.Body>
                                                                        <div className="card-action-wrap">
                                                                            <Badge bg={u.role === 'admin' ? 'primary' : 'secondary'} className="fw-normal">
                                                                                {u.role}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="media align-items-center">
                                                                            <div className="media-head me-3">
                                                                                <div
                                                                                    className={`avatar avatar-rounded ${colorForName(u.name)} d-flex align-items-center justify-content-center`}
                                                                                    style={{ width: 40, height: 40 }}
                                                                                >
                                                                                    <span className="initial-wrap fw-bold">
                                                                                        {u.name?.charAt(0).toUpperCase()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="media-body">
                                                                                <div className="fw-medium">{u.name}</div>
                                                                                <div className="text-muted fs-7 text-truncate">{u.email}</div>
                                                                                {u.username && (
                                                                                    <div className="text-muted" style={{ fontSize: 11 }}>@{u.username}</div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </Card.Body>
                                                                </Card>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                )}
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Col>
                                </Row>
                            </Container>
                        </SimpleBar>
                    </div>
                </Tab.Container>
            </div>

            {/* Add Board Modal */}
            <Modal show={showAddBoard} onHide={() => setShowAddBoard(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Board</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Board Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                placeholder="e.g. Q2 Sales Campaign"
                                value={boardForm.name}
                                onChange={e => handleBoardChange('name', e.target.value)}
                                isInvalid={!!boardErrors.name}
                            />
                            <Form.Control.Feedback type="invalid">{boardErrors.name}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Visibility</Form.Label>
                            <Form.Select value={boardForm.visibility} onChange={e => handleBoardChange('visibility', e.target.value)}>
                                <option value="public">Public — visible to all team members</option>
                                <option value="private">Private — only visible to you</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="What is this board for?"
                                value={boardForm.description}
                                onChange={e => handleBoardChange('description', e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddBoard(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddBoard}>Create Board</Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Board Modal */}
            <Modal show={showEditBoard} onHide={() => setShowEditBoard(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Board</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Board Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                value={boardForm.name}
                                onChange={e => handleBoardChange('name', e.target.value)}
                                isInvalid={!!boardErrors.name}
                            />
                            <Form.Control.Feedback type="invalid">{boardErrors.name}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Visibility</Form.Label>
                            <Form.Select value={boardForm.visibility} onChange={e => handleBoardChange('visibility', e.target.value)}>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={boardForm.description}
                                onChange={e => handleBoardChange('description', e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditBoard(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleEditSave}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = ({ boards, auth }) => ({
    boards,
    currentUser: auth.currentUser,
});

export default connect(mapStateToProps, { addBoard, updateBoard, deleteBoard })(TaskBoard);
