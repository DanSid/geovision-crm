import React, { useMemo, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { AlignLeft, Bell, Calendar, CheckSquare, Clock, Search, Settings, Tag } from 'react-feather';
import { Button, Container, Dropdown, Form, InputGroup, Nav, Navbar } from 'react-bootstrap';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { logoutUser } from '../../redux/action/Auth';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import JampackBadge from '../../components/@hk-badge/@hk-badge';
import classNames from 'classnames';
import { motion } from '../../utils/motion-shim.jsx';
import { ThemeSwitcher } from '../../utils/theme-provider/theme-switcher';

// ── Due-date helpers ──────────────────────────────────────────────────────────
const getDueLabel = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const diffDays = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
};

const TopNav = ({ navCollapsed, toggleCollapsedNav, currentUser, logoutUser, tasks = [] }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const CloseSearchInput = () => {
        setSearchValue('');
        setShowDropdown(false);
    };

    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        open: { opacity: 1, y: 0 },
        close: { opacity: 0, y: 10 },
    };

    // ── Task notifications ────────────────────────────────────────────────────
    const dueNotifications = useMemo(() => {
        const now = new Date();
        return tasks
            .filter((t) => {
                if (t.done) return false;
                const due = t.dueDate || t.deadline || t.Deadline;
                if (!due) return false;
                const d = new Date(due);
                if (isNaN(d)) return false;
                return Math.ceil((d - now) / (1000 * 60 * 60 * 24)) <= 3;
            })
            .sort((a, b) => {
                const da = new Date(a.dueDate || a.deadline || a.Deadline || 0);
                const db = new Date(b.dueDate || b.deadline || b.Deadline || 0);
                return da - db;
            });
    }, [tasks]);

    const notifCount = dueNotifications.length;

    // ── User avatar ───────────────────────────────────────────────────────────
    const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U';
    const userPhoto = currentUser?.photo || null;

    const AvatarDisplay = ({ size = 'xs' }) =>
        userPhoto ? (
            <img
                src={userPhoto}
                alt={currentUser?.name || 'User'}
                className={`avatar-img`}
                style={{ objectFit: 'cover', borderRadius: '50%', width: '100%', height: '100%' }}
            />
        ) : (
            <span className="initial-wrap">{userInitial}</span>
        );

    return (
        <Navbar expand="xl" className="hk-navbar navbar-light fixed-top">
            <Container fluid>
                {/* Start Nav */}
                <div className="nav-start-wrap">
                    <Button
                        variant="flush-dark"
                        onClick={() => toggleCollapsedNav(!navCollapsed)}
                        className="btn-icon btn-rounded flush-soft-hover navbar-toggle d-xl-none"
                    >
                        <span className="icon">
                            <span className="feather-icon"><AlignLeft /></span>
                        </span>
                    </Button>

                    {/* Search */}
                    <Dropdown as={Form} className="navbar-search" show={showDropdown}>
                        <Dropdown.Toggle as="div" className="no-caret bg-transparent">
                            <Button
                                variant="flush-dark"
                                className="btn-icon btn-rounded flush-soft-hover d-xl-none"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <span className="icon">
                                    <span className="feather-icon"><Search /></span>
                                </span>
                            </Button>
                            <InputGroup className="d-xl-flex d-none">
                                <span className="input-affix-wrapper input-search affix-border">
                                    <Form.Control
                                        type="text"
                                        className="bg-transparent"
                                        data-navbar-search-close="false"
                                        placeholder="Search..."
                                        aria-label="Search"
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setShowDropdown(false)}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                    <span className="input-suffix" onClick={() => setSearchValue('')}>
                                        <span>/</span>
                                        <span className="btn-input-clear">
                                            <i className="bi bi-x-circle-fill" />
                                        </span>
                                    </span>
                                </span>
                            </InputGroup>
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                            as={motion.div}
                            initial="initial"
                            animate={showDropdown ? 'open' : 'close'}
                            variants={pageVariants}
                            transition={{ duration: 0.3 }}
                            className={classNames('p-0')}
                        >
                            <Dropdown.Item className="d-xl-none bg-transparent">
                                <InputGroup className="mobile-search">
                                    <span className="input-affix-wrapper input-search">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search..."
                                            aria-label="Search"
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                            onFocus={() => setShowDropdown(true)}
                                            autoFocus
                                        />
                                        <span className="input-suffix" onClick={CloseSearchInput}>
                                            <span className="btn-input-clear">
                                                <i className="bi bi-x-circle-fill" />
                                            </span>
                                        </span>
                                    </span>
                                </InputGroup>
                            </Dropdown.Item>
                            <SimpleBar className="dropdown-body p-2">
                                <Dropdown.Header>Recent Search</Dropdown.Header>
                                <Dropdown.Item className="bg-transparent">
                                    <JampackBadge bg="secondary" soft pill className="me-1">CRM</JampackBadge>
                                    <JampackBadge bg="secondary" soft pill className="me-1">Tasks</JampackBadge>
                                    <JampackBadge bg="secondary" soft pill>Contacts</JampackBadge>
                                </Dropdown.Item>
                            </SimpleBar>
                            <div className="dropdown-footer d-xl-flex d-none">
                                <Link to="#"><u>Search all</u></Link>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                {/* /Start Nav */}

                {/* End Nav */}
                <div className="nav-end-wrap">
                    <Nav className="navbar-nav flex-row">
                        <Nav.Item className="ms-2">
                            <ThemeSwitcher />
                        </Nav.Item>

                        {/* ── Notifications ── */}
                        <Nav.Item>
                            <Dropdown className="dropdown-notifications">
                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret">
                                    <span className="icon">
                                        <span className="position-relative">
                                            <span className="feather-icon"><Bell /></span>
                                            {notifCount > 0 ? (
                                                <JampackBadge bg="danger" pill size="sm" className="position-top-end-overflow-1">
                                                    {notifCount > 99 ? '99+' : notifCount}
                                                </JampackBadge>
                                            ) : (
                                                <JampackBadge bg="success" indicator className="position-top-end-overflow-1" />
                                            )}
                                        </span>
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" className="p-0">
                                    <Dropdown.Header className="px-4 fs-6 d-flex align-items-center justify-content-between">
                                        <span>
                                            Notifications
                                            {notifCount > 0 && (
                                                <JampackBadge bg="danger" size="sm" soft className="ms-2">
                                                    {notifCount} pending
                                                </JampackBadge>
                                            )}
                                        </span>
                                        <Button
                                            variant="flush-dark"
                                            as={Link}
                                            to="/apps/tasks/task-list"
                                            className="btn-icon btn-rounded flush-soft-hover"
                                            size="sm"
                                        >
                                            <span className="feather-icon"><Settings /></span>
                                        </Button>
                                    </Dropdown.Header>
                                    <SimpleBar className="dropdown-body p-2" style={{ maxHeight: 360 }}>
                                        {dueNotifications.length === 0 ? (
                                            <div className="text-center py-4 text-muted fs-7">
                                                <span className="feather-icon d-block mb-2">
                                                    <CheckSquare size={28} />
                                                </span>
                                                All tasks are on track!
                                            </div>
                                        ) : (
                                            dueNotifications.map((task) => {
                                                const due = task.dueDate || task.deadline || task.Deadline;
                                                const overdue = new Date(due) < new Date();
                                                const label = getDueLabel(due);
                                                const taskName = task.title || task.Task_Name || task.name || 'Untitled Task';
                                                return (
                                                    <Dropdown.Item key={task.id} as={Link} to="/apps/tasks/task-list">
                                                        <div className="media">
                                                            <div className="media-head">
                                                                <div className={`avatar avatar-icon avatar-sm avatar-${overdue ? 'danger' : 'warning'} avatar-rounded`}>
                                                                    <span className="initial-wrap">
                                                                        <span className="feather-icon">
                                                                            {overdue ? <Clock /> : <Calendar />}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="media-body">
                                                                <div className="notifications-text">
                                                                    <strong>{taskName}</strong>
                                                                </div>
                                                                <div className="notifications-info">
                                                                    <JampackBadge bg={overdue ? 'danger' : 'warning'} soft>
                                                                        {overdue ? 'Overdue' : 'Due soon'}
                                                                    </JampackBadge>
                                                                    <div className="notifications-time">{label}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Dropdown.Item>
                                                );
                                            })
                                        )}
                                    </SimpleBar>
                                    <div className="dropdown-footer">
                                        <Link to="/apps/tasks/task-list">
                                            <u>View all tasks</u>
                                        </Link>
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav.Item>

                        {/* ── User dropdown ── */}
                        <Nav.Item>
                            <Dropdown className="ps-2">
                                <Dropdown.Toggle as={Link} to="#" className="no-caret">
                                    <div
                                        className="avatar avatar-primary avatar-rounded avatar-xs d-flex align-items-center justify-content-center overflow-hidden"
                                        style={{ fontSize: 13 }}
                                    >
                                        <AvatarDisplay size="xs" />
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" style={{ minWidth: 240 }}>
                                    {/* User info header */}
                                    <div className="p-3 border-bottom">
                                        <div className="d-flex align-items-center gap-2">
                                            <div
                                                className="avatar avatar-primary avatar-sm avatar-rounded d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                                style={{ width: 40, height: 40 }}
                                            >
                                                <AvatarDisplay size="sm" />
                                            </div>
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="fw-semibold text-dark text-truncate">
                                                    {currentUser?.name || 'User'}
                                                </div>
                                                <div className="fs-7 text-muted text-truncate">
                                                    {currentUser?.email || ''}
                                                </div>
                                                <span className={`badge badge-sm badge-soft-${currentUser?.role === 'admin' ? 'primary' : 'secondary'} mt-1`}>
                                                    {currentUser?.role || 'user'}
                                                </span>
                                            </div>
                                        </div>
                                        {currentUser && (
                                            <div className="mt-2">
                                                <Link
                                                    to="#"
                                                    className="fs-8 text-muted text-decoration-underline"
                                                    onClick={(e) => { e.preventDefault(); logoutUser(); }}
                                                >
                                                    Sign Out
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <Dropdown.Item as={Link} to="/pages/profile">
                                        <span className="dropdown-icon feather-icon"><CheckSquare /></span>
                                        <span>Profile</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/settings">
                                        <span className="dropdown-icon feather-icon"><Settings /></span>
                                        <span>Settings</span>
                                    </Dropdown.Item>

                                    <div className="dropdown-divider" />
                                    <Dropdown.Item onClick={logoutUser} className="text-danger">
                                        <span className="dropdown-icon feather-icon"><Tag /></span>
                                        <span>Sign Out</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav.Item>
                    </Nav>
                </div>
                {/* /End Nav */}
            </Container>
        </Navbar>
    );
};

const mapStateToProps = ({ theme, auth, tasks }) => ({
    navCollapsed: theme.navCollapsed,
    currentUser: auth.currentUser,
    tasks: tasks || [],
});

export default connect(mapStateToProps, { toggleCollapsedNav, logoutUser })(TopNav);
