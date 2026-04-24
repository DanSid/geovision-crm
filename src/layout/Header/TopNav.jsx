import React, { useEffect, useMemo, useRef, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { AlignLeft, Bell, Calendar, CheckSquare, Clock, Mail, Phone, Search, Settings, Tag, X } from 'react-feather';
import { Button, Container, Dropdown, Form, InputGroup, Modal, Nav, Navbar } from 'react-bootstrap';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { logoutUser } from '../../redux/action/Auth';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import JampackBadge from '../../components/@hk-badge/@hk-badge';
import classNames from 'classnames';
import { motion } from '../../utils/motion-shim.jsx';
import { ThemeSwitcher } from '../../utils/theme-provider/theme-switcher';
import {
    getActivityDateTime,
    isActivityDueNow,
    isActivityTodayOrOverdue,
    toLocalDateKey,
} from '../../utils/activitySchedule';

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

const fmtActivityDate = (dateVal, timeStr) => {
    const dt = getActivityDateTime({ date: dateVal, time: timeStr });
    if (!dt) return dateVal || '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dtDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.round((dtDay - today) / (1000 * 60 * 60 * 24));

    const hasTime = String(dateVal || '').includes('T') || !!String(timeStr || '').trim();
    const timePart = hasTime
        ? ` at ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        : '';

    if (diffDays === 0) return `Today${timePart}`;
    if (diffDays === -1) return `Yesterday${timePart}`;
    if (diffDays === 1) return `Tomorrow${timePart}`;
    if (diffDays < 0) return `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${timePart} (overdue)`;
    return `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${timePart}`;
};

const ACTIVITY_META = {
    Meeting: { icon: <Calendar size={14} />, bg: 'primary' },
    Call: { icon: <Phone size={14} />, bg: 'success' },
    Email: { icon: <Mail size={14} />, bg: 'info' },
    'To-Do': { icon: <CheckSquare size={14} />, bg: 'warning' },
};

const SESSION_ALERTED = new Set();

const TopNav = ({
    navCollapsed,
    toggleCollapsedNav,
    currentUser,
    logoutUser,
    tasks = [],
    opportunities = [],
    activities = [],
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [alertQueue, setAlertQueue] = useState([]);

    const currentAlert = alertQueue[0] || null;
    const dismissAlert = () => setAlertQueue((prev) => prev.slice(1));

    const CloseSearchInput = () => {
        setSearchValue('');
        setShowDropdown(false);
    };

    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        open: { opacity: 1, y: 0 },
        close: { opacity: 0, y: 10 },
    };

    const enqueue = (activity) => {
        const aid = String(activity?.id || activity?._id || '');
        if (!aid || SESSION_ALERTED.has(aid)) return;
        SESSION_ALERTED.add(aid);
        setAlertQueue((prev) =>
            prev.some((item) => String(item.id || item._id) === aid) ? prev : [...prev, activity]
        );
    };

    useEffect(() => {
        const handler = (event) => {
            if (event.detail) enqueue(event.detail);
        };
        window.addEventListener('gv-activity-due', handler);
        return () => window.removeEventListener('gv-activity-due', handler);
    }, []);

    const checkRef = useRef(null);
    useEffect(() => {
        checkRef.current = () => {
            activities
                .filter((activity) => !activity.completed && ACTIVITY_META[activity.type] && isActivityDueNow(activity))
                .forEach(enqueue);
        };
        checkRef.current();
    }, [activities]);

    useEffect(() => {
        const timer = setInterval(() => checkRef.current?.(), 30 * 1000);
        return () => clearInterval(timer);
    }, []);

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

    const oppNotifications = useMemo(() => {
        const now = new Date();
        const closedStages = ['Closed Won', 'Closed Lost'];
        return opportunities
            .filter((opp) => {
                if (closedStages.includes(opp.stage)) return false;
                const due = opp.expectedCloseDate || opp.closeDate;
                if (!due) return false;
                const dt = new Date(due);
                if (Number.isNaN(dt.getTime())) return false;
                return Math.ceil((dt - now) / (1000 * 60 * 60 * 24)) <= 7;
            })
            .sort((a, b) => {
                const da = new Date(a.expectedCloseDate || a.closeDate || 0);
                const db = new Date(b.expectedCloseDate || b.closeDate || 0);
                return da - db;
            });
    }, [opportunities]);

    const activityNotifications = useMemo(() => {
        return activities
            .filter((activity) => !activity.completed && ACTIVITY_META[activity.type] && isActivityTodayOrOverdue(activity))
            .sort((a, b) => {
                const da = getActivityDateTime(a) || new Date(a.createdAt || 0);
                const db = getActivityDateTime(b) || new Date(b.createdAt || 0);
                return da - db;
            })
            .slice(0, 10);
    }, [activities]);

    const notifCount = dueNotifications.length + oppNotifications.length + activityNotifications.length;

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
                                        {notifCount === 0 ? (
                                            <div className="text-center py-4 text-muted fs-7">
                                                <span className="feather-icon d-block mb-2">
                                                    <CheckSquare size={28} />
                                                </span>
                                                No pending reminders.
                                            </div>
                                        ) : (
                                            <>
                                                {activityNotifications.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1 text-muted fs-8 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                                                            Sales Activities
                                                        </div>
                                                        {activityNotifications.map((activity) => {
                                                            const id = activity.id || activity._id;
                                                            const meta = ACTIVITY_META[activity.type] || ACTIVITY_META.Meeting;
                                                            const dateStr = toLocalDateKey(getActivityDateTime(activity));
                                                            const todayStr = toLocalDateKey(new Date());
                                                            const overdue = !!dateStr && dateStr < todayStr;
                                                            return (
                                                                <Dropdown.Item key={`act-${id}`} as={Link} to="/apps/contacts/contact-list">
                                                                    <div className="media">
                                                                        <div className="media-head">
                                                                            <div className={`avatar avatar-icon avatar-sm avatar-${overdue ? 'danger' : meta.bg} avatar-rounded`}>
                                                                                <span className="initial-wrap">
                                                                                    <span className="feather-icon">{meta.icon}</span>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="media-body">
                                                                            <div className="notifications-text">
                                                                                <strong>{activity.title || activity.type}</strong>
                                                                            </div>
                                                                            <div className="notifications-info">
                                                                                <JampackBadge bg={overdue ? 'danger' : meta.bg} soft>
                                                                                    {overdue ? `${activity.type} overdue` : `${activity.type} today`}
                                                                                </JampackBadge>
                                                                                <div className="notifications-time">{fmtActivityDate(activity.date, activity.time)}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Dropdown.Item>
                                                            );
                                                        })}
                                                    </>
                                                )}

                                                {dueNotifications.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1 mt-1 text-muted fs-8 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                                                            Tasks
                                                        </div>
                                                        {dueNotifications.map((task) => {
                                                            const due = task.dueDate || task.deadline || task.Deadline;
                                                            const overdue = new Date(due) < new Date();
                                                            const label = getDueLabel(due);
                                                            const taskName = task.title || task.Task_Name || task.name || 'Untitled Task';
                                                            return (
                                                                <Dropdown.Item key={`task-${task.id}`} as={Link} to="/apps/tasks/task-list">
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
                                                        })}
                                                    </>
                                                )}

                                                {oppNotifications.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1 mt-1 text-muted fs-8 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                                                            Opportunities
                                                        </div>
                                                        {oppNotifications.map((opp) => {
                                                            const due = opp.expectedCloseDate || opp.closeDate;
                                                            const overdue = new Date(due) < new Date();
                                                            return (
                                                                <Dropdown.Item key={`opp-${opp.id || opp._id}`} as={Link} to="/apps/opportunities">
                                                                    <div className="media">
                                                                        <div className="media-head">
                                                                            <div className={`avatar avatar-icon avatar-sm avatar-${overdue ? 'danger' : 'success'} avatar-rounded`}>
                                                                                <span className="initial-wrap">
                                                                                    <span className="feather-icon"><Calendar /></span>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="media-body">
                                                                            <div className="notifications-text">
                                                                                <strong>{opp.name || opp.title || 'Untitled Opportunity'}</strong>
                                                                            </div>
                                                                            <div className="notifications-info">
                                                                                <JampackBadge bg={overdue ? 'danger' : 'success'} soft>
                                                                                    {overdue ? 'Close date passed' : 'Closing soon'}
                                                                                </JampackBadge>
                                                                                <div className="notifications-time">{getDueLabel(due)}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Dropdown.Item>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </SimpleBar>
                                    <div className="dropdown-footer">
                                        <Link to="/apps/calendar">
                                            <u>View all activities</u>
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

            {currentAlert && (() => {
                const meta = ACTIVITY_META[currentAlert.type] || ACTIVITY_META.Meeting;
                const queueLen = alertQueue.length;
                return (
                    <Modal show centered onHide={dismissAlert} backdrop="static">
                        <Modal.Header className="py-3" style={{ borderBottom: '2px solid var(--bs-primary-bg-subtle)' }}>
                            <Modal.Title className="fs-6 d-flex align-items-center gap-2">
                                <span className={`avatar avatar-icon avatar-sm avatar-${meta.bg} avatar-rounded`}>
                                    <span className="initial-wrap">
                                        <span className="feather-icon">{meta.icon}</span>
                                    </span>
                                </span>
                                {currentAlert.type} Reminder
                                {queueLen > 1 && (
                                    <JampackBadge bg="secondary" soft className="ms-1">{queueLen} pending</JampackBadge>
                                )}
                            </Modal.Title>
                            <button type="button" className="btn-close" onClick={dismissAlert} aria-label="Close" />
                        </Modal.Header>
                        <Modal.Body>
                            <p className="fw-semibold mb-2 fs-6">{currentAlert.title || currentAlert.type}</p>
                            {currentAlert.description && (
                                <p className="text-muted fs-7 mb-2" style={{ whiteSpace: 'pre-line' }}>
                                    {currentAlert.description}
                                </p>
                            )}
                            <div className="d-flex align-items-center gap-2 mt-3">
                                <span className="feather-icon text-muted"><Clock size={14} /></span>
                                <span className="fs-7 text-muted">{fmtActivityDate(currentAlert.date, currentAlert.time)}</span>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="py-2 gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={dismissAlert}>
                                <X size={13} className="me-1" />Dismiss
                            </Button>
                            <Button variant={meta.bg === 'warning' ? 'warning' : meta.bg} size="sm" as={Link} to="/apps/calendar" onClick={dismissAlert}>
                                <Calendar size={13} className="me-1" />View Calendar
                            </Button>
                        </Modal.Footer>
                    </Modal>
                );
            })()}
        </Navbar>
    );
};

const mapStateToProps = ({ theme, auth, tasks, opportunities, activities }) => ({
    navCollapsed: theme.navCollapsed,
    currentUser: auth.currentUser,
    tasks: tasks || [],
    opportunities: opportunities || [],
    activities: activities || [],
});

export default connect(mapStateToProps, { toggleCollapsedNav, logoutUser })(TopNav);
