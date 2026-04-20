import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    Button, Card, Col, Container, Form, Row, Badge, Alert, Table, Modal, InputGroup
} from 'react-bootstrap';
import { setPermission, resetPermissions } from '../../redux/action/Crm';

const TAB_LABELS = {
    dashboard: 'Dashboard',
    scrumboard: 'Scrumboard',
    contacts: 'Contacts',
    opportunities: 'Opportunities',
    customers: 'Customers',
    calendar: 'Calendar',
    tasks: 'Tasks',
    accounts: 'Accounts',
    settings: 'Settings',
};

const TAB_ICONS = {
    dashboard: 'ri-dashboard-line',
    scrumboard: 'ri-kanban-view',
    contacts: 'ri-contacts-book-line',
    opportunities: 'ri-bar-chart-line',
    customers: 'ri-user-3-line',
    calendar: 'ri-calendar-line',
    tasks: 'ri-task-line',
    accounts: 'ri-file-list-3-line',
    settings: 'ri-settings-3-line',
};

// Load all users from localStorage (admin sees all)
const loadAllUsers = () => {
    try {
        const users = localStorage.getItem('gv_crm_users');
        return users ? JSON.parse(users).map(({ password: _p, ...u }) => u) : [];
    } catch { return []; }
};

const saveAllUsers = (users) => {
    try {
        // We need to keep passwords - load raw then update roles
        const raw = JSON.parse(localStorage.getItem('gv_crm_users') || '[]');
        const updated = raw.map(u => {
            const match = users.find(nu => nu.id === u.id);
            return match ? { ...u, role: match.role } : u;
        });
        localStorage.setItem('gv_crm_users', JSON.stringify(updated));
    } catch { /* ignore */ }
};

const Settings = ({ currentUser, permissions, setPermission, resetPermissions }) => {
    const isAdmin = currentUser?.role === 'admin';
    const [users, setUsers] = useState(loadAllUsers);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userPerms, setUserPerms] = useState({});
    const [saved, setSaved] = useState(false);

    const handleToggle = (key) => {
        if (!isAdmin) return;
        setPermission(key, !permissions[key]);
        setSaved(false);
    };

    const handleReset = () => {
        resetPermissions();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const openUserPerms = (user) => {
        // Load user-specific permissions if any
        try {
            const stored = localStorage.getItem(`gv_crm_user_perms_${user.id}`);
            setUserPerms(stored ? JSON.parse(stored) : { ...permissions });
        } catch { setUserPerms({ ...permissions }); }
        setEditingUser(user);
        setShowUserModal(true);
    };

    const saveUserPerms = () => {
        try { localStorage.setItem(`gv_crm_user_perms_${editingUser.id}`, JSON.stringify(userPerms)); } catch { /* ignore */ }
        setShowUserModal(false);
    };

    const toggleRole = (userId, currentRole) => {
        if (!isAdmin) return;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
        setUsers(updated);
        saveAllUsers(updated);
    };

    if (!isAdmin) {
        return (
            <Container fluid className="py-4">
                <div className="text-center py-5">
                    <i className="ri-lock-line fs-1 text-muted d-block mb-3" />
                    <h5>Access Restricted</h5>
                    <p className="text-muted">Only administrators can access settings.</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <div className="mb-4">
                <h1 className="pg-title mb-1">Settings</h1>
                <p className="text-muted mb-0">Manage application settings and user permissions</p>
            </div>

            {saved && <Alert variant="success" className="mb-4">Permissions reset to defaults.</Alert>}

            <Row className="g-4">
                {/* Global Tab Visibility */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h6 className="mb-0">
                                <i className="ri-eye-line me-2 text-primary" />
                                Global Tab Visibility
                            </h6>
                            <p className="text-muted fs-7 mb-0 mt-1">Control which sidebar sections are visible to all users</p>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-column gap-3">
                                {Object.keys(TAB_LABELS).map(key => (
                                    <div key={key} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className={`${TAB_ICONS[key]} fs-5 text-muted`} />
                                            <span className="fw-medium">{TAB_LABELS[key]}</span>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id={`perm-${key}`}
                                            checked={!!permissions[key]}
                                            onChange={() => handleToggle(key)}
                                            label={permissions[key] ? 'Visible' : 'Hidden'}
                                            className="text-muted fs-7"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="d-flex gap-2 mt-4">
                                <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                                    <i className="ri-refresh-line me-1" /> Reset to Defaults
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* User Management */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h6 className="mb-0">
                                <i className="ri-team-line me-2 text-primary" />
                                User Management
                            </h6>
                            <p className="text-muted fs-7 mb-0 mt-1">Manage user roles and individual permissions</p>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {users.length === 0 ? (
                                <div className="text-center py-5 text-muted p-3">
                                    <i className="ri-user-line fs-1 d-block mb-2" />
                                    No users registered yet.
                                </div>
                            ) : (
                                <Table hover responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="fw-medium">{u.name}</div>
                                                    <div className="text-muted fs-7">{u.email}</div>
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg={u.role === 'admin' ? 'primary' : 'secondary'}
                                                        className="fw-normal"
                                                    >
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="soft-info"
                                                        className="me-1 btn-rounded"
                                                        onClick={() => openUserPerms(u)}
                                                        title="Set tab permissions for this user"
                                                    >
                                                        <i className="ri-shield-keyhole-line me-1" />
                                                        Permissions
                                                    </Button>
                                                    {u.id !== currentUser.id && (
                                                        <Button
                                                            size="sm"
                                                            variant={u.role === 'admin' ? 'soft-warning' : 'soft-success'}
                                                            className="btn-rounded"
                                                            onClick={() => toggleRole(u.id, u.role)}
                                                            title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                                                        >
                                                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* User Permissions Modal */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Permissions for {editingUser?.name}
                        <div className="text-muted fs-7 fw-normal">{editingUser?.email}</div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted fs-7 mb-3">Control which tabs this user can access.</p>
                    <div className="d-flex flex-column gap-2">
                        {Object.keys(TAB_LABELS).map(key => (
                            <div key={key} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                <div className="d-flex align-items-center gap-2">
                                    <i className={`${TAB_ICONS[key]} text-muted`} />
                                    <span>{TAB_LABELS[key]}</span>
                                </div>
                                <Form.Check
                                    type="switch"
                                    id={`user-perm-${key}`}
                                    checked={userPerms[key] !== false}
                                    onChange={() => setUserPerms(p => ({ ...p, [key]: !p[key] }))}
                                />
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={saveUserPerms}>Save Permissions</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

const mapStateToProps = ({ auth, permissions }) => ({
    currentUser: auth.currentUser,
    permissions,
});
export default connect(mapStateToProps, { setPermission, resetPermissions })(Settings);
