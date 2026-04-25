import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    Button, Card, Col, Container, Form, Row, Badge, Modal, Table,
} from 'react-bootstrap';
import { setPermission, resetPermissions, saveUserPermissionsAction } from '../../redux/action/Crm';
import {
    SECTION_KEYS, SECTION_LABELS, SECTION_DESCRIPTIONS, SECTION_ICONS,
    DEFAULT_PERMISSIONS, loadUserPermissions,
} from '../../utils/permissions';
import { showToast } from '../../components/GlobalToast';

// ── Load all users from localStorage (strips passwords) ─────────────────────
const loadAllUsers = () => {
    try {
        const raw = localStorage.getItem('gv_crm_users');
        return raw ? JSON.parse(raw).map(({ password: _p, ...u }) => u) : [];
    } catch { return []; }
};

const persistAllUsers = (updatedUsers) => {
    try {
        const raw = JSON.parse(localStorage.getItem('gv_crm_users') || '[]');
        const merged = raw.map(u => {
            const match = updatedUsers.find(nu => nu.id === u.id);
            return match ? { ...u, role: match.role } : u;
        });
        localStorage.setItem('gv_crm_users', JSON.stringify(merged));
    } catch { /* ignore */ }
};

/* ══════════════════════════════════════════════════════════════════════════
   Settings
══════════════════════════════════════════════════════════════════════════ */
const Settings = ({ currentUser, permissions, setPermission, resetPermissions, saveUserPermissionsAction }) => {
    const isAdmin = currentUser?.role === 'admin';

    // ── Global permissions (local draft — applied on button click) ──
    const [draft, setDraft] = useState(() => ({ ...DEFAULT_PERMISSIONS, ...permissions }));

    // Keep draft in sync when Redux permissions change from outside
    useEffect(() => {
        setDraft(prev => ({ ...prev, ...permissions }));
    }, [permissions]);

    // ── User management ──
    const [users, setUsers] = useState(loadAllUsers);

    // ── Per-user permissions modal ──
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser,   setEditingUser]   = useState(null);
    const [userDraft,     setUserDraft]     = useState({});

    if (!isAdmin) {
        return (
            <Container fluid className="py-5">
                <div className="text-center py-5">
                    <i className="ri-lock-line fs-1 text-muted d-block mb-3" />
                    <h5>Access Restricted</h5>
                    <p className="text-muted">Only administrators can access Settings.</p>
                </div>
            </Container>
        );
    }

    // ── Handlers — global permissions ────────────────────────────────────────
    const handleDraftToggle = (key) => {
        setDraft(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleApplyGlobal = () => {
        // Dispatch each changed key to Redux (which also saves to localStorage)
        SECTION_KEYS.forEach(key => {
            if (permissions[key] !== draft[key]) {
                setPermission(key, draft[key]);
            }
        });
        showToast('Global section visibility updated.', 'success', 'Settings Saved');
    };

    const handleReset = () => {
        resetPermissions();
        setDraft({ ...DEFAULT_PERMISSIONS });
        showToast('Permissions reset to defaults.', 'info', 'Settings Reset');
    };

    // ── Handlers — user role toggle ──────────────────────────────────────────
    const handleToggleRole = (userId, currentRole) => {
        if (userId === currentUser.id) return; // can't demote yourself
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
        setUsers(updated);
        persistAllUsers(updated);
        showToast(
            `${updated.find(u => u.id === userId)?.name} is now ${newRole}.`,
            newRole === 'admin' ? 'success' : 'warning',
            'Role Updated',
        );
    };

    // ── Handlers — per-user permissions modal ────────────────────────────────
    const openUserPerms = (user) => {
        const stored = loadUserPermissions(user.id);
        // If user has custom perms → use them; else start from current global
        setUserDraft(stored || { ...DEFAULT_PERMISSIONS, ...permissions });
        setEditingUser(user);
        setShowUserModal(true);
    };

    const handleUserDraftToggle = (key) => {
        setUserDraft(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveUserPerms = () => {
        // Save to Supabase + Redux (works on all devices, not just admin's browser)
        saveUserPermissionsAction(editingUser.id, userDraft);
        setShowUserModal(false);
        showToast(
            `Permissions saved for ${editingUser.name}.`,
            'success',
            'User Permissions Updated',
        );
    };

    const handleResetUserPerms = () => {
        setUserDraft({ ...DEFAULT_PERMISSIONS, ...permissions });
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const draftChanged = SECTION_KEYS.some(k => draft[k] !== permissions[k]);

    return (
        <Container fluid className="py-4">
            {/* Page header */}
            <div className="mb-4">
                <h1 className="pg-title mb-1">Settings</h1>
                <p className="text-muted mb-0">Manage application sections and user access permissions</p>
            </div>

            <Row className="g-4">
                {/* ── Global Section Visibility ── */}
                <Col lg={6}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3">
                            <div className="d-flex align-items-center gap-2">
                                <i className="ri-eye-line fs-5 text-primary" />
                                <div>
                                    <div className="fw-semibold">Global Section Visibility</div>
                                    <div className="text-muted fs-7">
                                        Control which sidebar sections ALL non-admin users can see
                                    </div>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-column gap-1">
                                {SECTION_KEYS.map(key => (
                                    <div
                                        key={key}
                                        className="d-flex align-items-center justify-content-between py-2 px-1 rounded"
                                        style={{ borderBottom: '1px solid var(--bs-border-color)' }}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <i className={`${SECTION_ICONS[key]} fs-5 text-muted`} />
                                            <div>
                                                <div className="fw-medium" style={{ fontSize: 13 }}>
                                                    {SECTION_LABELS[key]}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: 11 }}>
                                                    {SECTION_DESCRIPTIONS[key]}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            {key === 'dashboard' || key === 'account' ? (
                                                <Badge bg="secondary" style={{ fontSize: 10 }}>Always On</Badge>
                                            ) : (
                                                <Form.Check
                                                    type="switch"
                                                    id={`perm-${key}`}
                                                    checked={!!draft[key]}
                                                    onChange={() => handleDraftToggle(key)}
                                                    label={
                                                        <span className={`fs-7 ${draft[key] ? 'text-success' : 'text-muted'}`}>
                                                            {draft[key] ? 'Visible' : 'Hidden'}
                                                        </span>
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex gap-2 mt-4">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleApplyGlobal}
                                    disabled={!draftChanged}
                                >
                                    <i className="ri-save-line me-1" /> Apply Changes
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleReset}
                                >
                                    <i className="ri-refresh-line me-1" /> Reset to Defaults
                                </Button>
                            </div>

                            {draftChanged && (
                                <div className="mt-2 text-warning fs-7">
                                    <i className="ri-information-line me-1" />
                                    Unsaved changes — click <strong>Apply Changes</strong> to save.
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* ── User Management ── */}
                <Col lg={6}>
                    <Card className="card-border h-100">
                        <Card.Header className="py-3">
                            <div className="d-flex align-items-center gap-2">
                                <i className="ri-team-line fs-5 text-primary" />
                                <div>
                                    <div className="fw-semibold">User Management</div>
                                    <div className="text-muted fs-7">
                                        Manage roles and set per-user section access
                                    </div>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {users.length === 0 ? (
                                <div className="text-center py-5 text-muted p-3">
                                    <i className="ri-user-line fs-1 d-block mb-2" />
                                    No users registered yet.
                                </div>
                            ) : (
                                <Table hover responsive className="mb-0 align-middle" style={{ fontSize: 13 }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => {
                                            const hasCustomPerms = !!loadUserPermissions(u.id);
                                            return (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="fw-medium">{u.name}</div>
                                                        <div className="text-muted fs-7">{u.email}</div>
                                                        {hasCustomPerms && (
                                                            <Badge bg="info" className="fw-normal mt-1" style={{ fontSize: 10 }}>
                                                                Custom Perms
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            bg={u.role === 'admin' ? 'primary' : 'secondary'}
                                                            className="fw-normal"
                                                        >
                                                            {u.role || 'user'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {u.role !== 'admin' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="soft-info"
                                                                    className="btn-rounded"
                                                                    onClick={() => openUserPerms(u)}
                                                                    title="Set section permissions for this user"
                                                                >
                                                                    <i className="ri-shield-keyhole-line me-1" />
                                                                    Permissions
                                                                </Button>
                                                            )}
                                                            {u.id !== currentUser.id && (
                                                                <Button
                                                                    size="sm"
                                                                    variant={u.role === 'admin' ? 'soft-warning' : 'soft-success'}
                                                                    className="btn-rounded"
                                                                    onClick={() => handleToggleRole(u.id, u.role)}
                                                                    title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                                                                >
                                                                    {u.role === 'admin' ? 'Demote' : 'Promote'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Per-User Permissions Modal ── */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered size="sm">
                <Modal.Header closeButton>
                    <div>
                        <Modal.Title className="fs-6 fw-bold">
                            <i className="ri-shield-keyhole-line me-2 text-primary" />
                            {editingUser?.name}
                        </Modal.Title>
                        <div className="text-muted fs-7 mt-1">{editingUser?.email}</div>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted fs-7 mb-3">
                        Override section access for this user. These settings override the global defaults.
                    </p>
                    <div className="d-flex flex-column gap-1">
                        {SECTION_KEYS.map(key => (
                            <div
                                key={key}
                                className="d-flex align-items-center justify-content-between py-2"
                                style={{ borderBottom: '1px solid var(--bs-border-color)' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <i className={`${SECTION_ICONS[key]} text-muted`} />
                                    <div>
                                        <div className="fw-medium" style={{ fontSize: 13 }}>
                                            {SECTION_LABELS[key]}
                                        </div>
                                    </div>
                                </div>
                                {key === 'dashboard' || key === 'account' ? (
                                    <Badge bg="secondary" style={{ fontSize: 10 }}>Always On</Badge>
                                ) : (
                                    <Form.Check
                                        type="switch"
                                        id={`user-perm-${key}`}
                                        checked={userDraft[key] !== false}
                                        onChange={() => handleUserDraftToggle(key)}
                                        label={
                                            <span className={`fs-7 ${userDraft[key] !== false ? 'text-success' : 'text-danger'}`}>
                                                {userDraft[key] !== false ? 'Allow' : 'Block'}
                                            </span>
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer className="gap-2">
                    <Button variant="outline-secondary" size="sm" onClick={handleResetUserPerms}>
                        <i className="ri-refresh-line me-1" /> Reset
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowUserModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveUserPerms}>
                        <i className="ri-save-line me-1" /> Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

const mapStateToProps = ({ auth, permissions }) => ({
    currentUser: auth.currentUser,
    permissions,
});
export default connect(mapStateToProps, { setPermission, resetPermissions, saveUserPermissionsAction })(Settings);
