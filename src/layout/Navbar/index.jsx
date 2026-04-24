import React, { useEffect, useMemo, useRef, useState } from 'react';
import SimpleBar from 'simplebar-react';
import {
    AlignLeft, Bell, Calendar, CheckSquare, Clock, Mail,
    Phone, Settings, Tag, TrendingUp, X,
} from 'react-feather';
import { Button, Container, Dropdown, Modal, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { logoutUser } from '../../redux/action/Auth';
import NavSearch from './NavSearch';
import CompactMenu from './CompactMenu';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import { ThemeSwitcher } from '../../utils/theme-provider/theme-switcher';
import { useTheme } from '../../utils/theme-provider/theme-provider';

import BrandSm from '../../assets/img/geovision-brand-sm.svg';
import BrandLight from '../../assets/img/geovision-logo.svg';
import BrandDark from '../../assets/img/geovision-logo-dark.svg';

/* ── Relative-date label for tasks/opportunities ─────────────────────────── */
const fmtRelative = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
};

/* ── Human-friendly date+time for activities ─────────────────────────────── */
const fmtActivityDate = (dateVal, timeStr) => {
    if (!dateVal) return '';
    let dt;
    try {
        if (dateVal.includes('T')) {
            dt = new Date(dateVal);
        } else if (timeStr) {
            dt = new Date(`${dateVal}T${timeStr}`);
        } else {
            dt = new Date(dateVal + 'T00:00:00');
        }
        if (isNaN(dt)) return dateVal;
    } catch { return dateVal; }

    const now = new Date();
    const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dtDay    = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.round((dtDay - today) / (1000 * 60 * 60 * 24));

    const hasTime  = dateVal.includes('T') || !!timeStr;
    const timePart = hasTime
        ? ' at ' + dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';

    if (diffDays === 0)  return `Today${timePart}`;
    if (diffDays === -1) return `Yesterday${timePart}`;
    if (diffDays === 1)  return `Tomorrow${timePart}`;
    if (diffDays < 0)    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + timePart + ' (overdue)';
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + timePart;
};

/* ── Icon + colour per activity type ─────────────────────────────────────── */
const ACTIVITY_META = {
    Meeting: { icon: <Calendar size={14} />, bg: 'primary' },
    Call:    { icon: <Phone    size={14} />, bg: 'success' },
    Email:   { icon: <Mail     size={14} />, bg: 'info'    },
    'To-Do': { icon: <CheckSquare size={14} />, bg: 'warning' },
};

/* ── ALERTED_KEY for localStorage deduplication ──────────────────────────── */
const ALERTED_KEY = 'gv_alerted_activities';
const getAlerted    = () => new Set(JSON.parse(localStorage.getItem(ALERTED_KEY) || '[]'));
const markAlerted   = (id) => {
    const s = getAlerted(); s.add(String(id));
    localStorage.setItem(ALERTED_KEY, JSON.stringify([...s]));
};

/* ══════════════════════════════════════════════════════════════════════════ */
const CompactNav = ({
    navCollapsed, toggleCollapsedNav,
    currentUser, logoutUser,
    tasks = [], opportunities = [], activities = [],
}) => {
    const { theme } = useTheme();

    /* ── Alert modal queue ── */
    const [alertQueue, setAlertQueue] = useState([]);
    const currentAlert = alertQueue[0] || null;
    const dismissAlert = () => setAlertQueue(prev => prev.slice(1));

    /* ── Check for due activities (on mount + every 60 s) ── */
    const activitiesRef = useRef(activities);
    activitiesRef.current = activities;

    useEffect(() => {
        const isDue = (a) => {
            const dateVal = a.date;
            if (!dateVal) return false;
            let dt;
            try {
                if (dateVal.includes('T'))      dt = new Date(dateVal);
                else if (a.time)                dt = new Date(`${dateVal}T${a.time}`);
                else                            return false; // no specific time → no popup
                if (isNaN(dt)) return false;
            } catch { return false; }
            const diffMs = Date.now() - dt.getTime();
            // Due within the last 60 minutes (catches page-load near schedule time)
            return diffMs >= 0 && diffMs <= 60 * 60 * 1000;
        };

        const check = () => {
            const alerted = getAlerted();
            const newAlerts = activitiesRef.current.filter(a => {
                if (a.completed) return false;
                if (!ACTIVITY_META[a.type]) return false;
                if (alerted.has(String(a.id || a._id))) return false;
                return isDue(a);
            });
            if (newAlerts.length > 0) {
                newAlerts.forEach(a => markAlerted(a.id || a._id));
                setAlertQueue(prev => [...prev, ...newAlerts]);
            }
        };

        check();
        const timer = setInterval(check, 60 * 1000);
        return () => clearInterval(timer);
    }, []); // intentionally empty — uses ref for activities

    /* ── Task due-soon notifications (within 3 days) ── */
    const dueNotifications = useMemo(() => {
        const now = new Date();
        return tasks
            .filter((t) => {
                if (t.done) return false;
                const due = t.dueDate || t.deadline || t.Deadline;
                if (!due) return false;
                const d = new Date(due);
                if (isNaN(d)) return false;
                const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                return diffDays <= 3;
            })
            .sort((a, b) => {
                const da = new Date(a.dueDate || a.deadline || a.Deadline || 0);
                const db = new Date(b.dueDate || b.deadline || b.Deadline || 0);
                return da - db;
            });
    }, [tasks]);

    /* ── Opportunity deadline notifications (closing within 7 days) ── */
    const oppNotifications = useMemo(() => {
        const now = new Date();
        const CLOSED = ['Closed Won', 'Closed Lost'];
        return opportunities
            .filter((o) => {
                if (CLOSED.includes(o.stage)) return false;
                const due = o.expectedCloseDate || o.closeDate;
                if (!due) return false;
                const d = new Date(due);
                if (isNaN(d)) return false;
                const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            })
            .sort((a, b) => {
                const da = new Date(a.expectedCloseDate || a.closeDate || 0);
                const db = new Date(b.expectedCloseDate || b.closeDate || 0);
                return da - db;
            });
    }, [opportunities]);

    /* ── Activity notifications (today or overdue, not completed) ── */
    const activityNotifications = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        return activities
            .filter(a => {
                if (a.completed) return false;
                if (!ACTIVITY_META[a.type]) return false;
                const dateVal = a.date;
                if (!dateVal) return false;
                const dateOnly = dateVal.slice(0, 10);
                return dateOnly <= todayStr;
            })
            .sort((a, b) => {
                const da = new Date(a.date || a.createdAt || 0);
                const db = new Date(b.date || b.createdAt || 0);
                return da - db; // soonest first
            })
            .slice(0, 10);
    }, [activities]);

    const notifCount = dueNotifications.length + oppNotifications.length + activityNotifications.length;

    return (
        <>
        <Navbar expand="xl" className="hk-navbar navbar-light fixed-top">
            <Container fluid>
                {/* Start Nav */}
                <div className="nav-start-wrap flex-fill">
                    <Link to="/" className="navbar-brand d-xl-flex d-none">
                        <img className="brand-img img-fluid" src={BrandSm} alt="brand" />
                        {theme === 'light'
                            ? <img src={BrandLight} alt="brand" className="brand-img img-fluid" />
                            : <img src={BrandDark} alt="brand" className="brand-img img-fluid" />
                        }
                    </Link>

                    <Button onClick={() => toggleCollapsedNav(!navCollapsed)} className="btn-icon btn-rounded btn-flush-dark flush-soft-hover navbar-toggle d-xl-none">
                        <span className="icon">
                            <span className="feather-icon"><AlignLeft /></span>
                        </span>
                    </Button>

                    <CompactMenu />
                    <div onClick={() => toggleCollapsedNav(!navCollapsed)} className="hk-menu-backdrop" />
                </div>
                {/* End Nav */}

                <div className="nav-end-wrap">
                    <NavSearch />
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
                                                <HkBadge bg="danger" pill size="sm" className="position-top-end-overflow-1">
                                                    {notifCount > 99 ? '99+' : notifCount}
                                                </HkBadge>
                                            ) : (
                                                <HkBadge bg="success" indicator className="position-top-end-overflow-1" />
                                            )}
                                        </span>
                                    </span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu align="end" className="p-0">
                                    <Dropdown.Header className="px-4 fs-6 d-flex align-items-center justify-content-between">
                                        <span>
                                            Notifications
                                            {notifCount > 0 && (
                                                <HkBadge bg="danger" size="sm" soft className="ms-2">{notifCount} pending</HkBadge>
                                            )}
                                        </span>
                                        <Button variant="flush-dark" as={Link} to="/apps/tasks/task-list" className="btn-icon btn-rounded flush-soft-hover" size="sm">
                                            <span className="feather-icon"><Settings /></span>
                                        </Button>
                                    </Dropdown.Header>

                                    <SimpleBar className="dropdown-body p-2" style={{ maxHeight: 420 }}>
                                        {notifCount === 0 ? (
                                            <div className="text-center py-4 text-muted fs-7">
                                                <span className="feather-icon d-block mb-2"><CheckSquare size={28} /></span>
                                                All tasks are on track!
                                            </div>
                                        ) : (
                                            <>
                                                {/* ── Activity notifications (Meeting / Call / Email / To-Do) ── */}
                                                {activityNotifications.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1 text-muted fs-8 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                                                            Sales Activities
                                                        </div>
                                                        {activityNotifications.map((a) => {
                                                            const id       = a.id || a._id;
                                                            const meta     = ACTIVITY_META[a.type] || ACTIVITY_META.Meeting;
                                                            const dateStr  = a.date?.slice(0, 10);
                                                            const todayStr = new Date().toISOString().slice(0, 10);
                                                            const overdue  = dateStr < todayStr;
                                                            const label    = fmtActivityDate(a.date, a.time);
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
                                                                                <strong>{a.title || a.type}</strong>
                                                                            </div>
                                                                            <div className="notifications-info">
                                                                                <HkBadge bg={overdue ? 'danger' : meta.bg} soft>
                                                                                    {overdue ? `${a.type} overdue` : `${a.type} today`}
                                                                                </HkBadge>
                                                                                <div className="notifications-time">{label}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Dropdown.Item>
                                                            );
                                                        })}
                                                    </>
                                                )}

                                                {/* ── Task notifications ── */}
                                                {dueNotifications.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1 mt-1 text-muted fs-8 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>Tasks</div>
                                                        {dueNotifications.map((task) => {
                                                            const due = task.dueDate || task.deadline || task.Deadline;
                                                            const overdue = new Date(due) < new Date();
                                                            const label = fmtRelative(due);
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
                                                                                <HkBadge bg={overdue ? 'danger' : 'warning'} soft>
                                                                                    {overdue ? 'Task overdue' : 'Due soon'}
                                                                                </HkBadge>
                                                                                <div className="notifications-time">{label}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Dropdown.Item>
                                                            );
                                                        })}
                                                    </>
                                                )}

                                                {/* ── Opportunity notifications ── */}
                                                {oppNotifications.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1 mt-1 text-muted fs-8 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>Opportunities</div>
                                                        {oppNotifications.map((opp) => {
                                                            const due = opp.expectedCloseDate || opp.closeDate;
                                                            const overdue = new Date(due) < new Date();
                                                            const label = fmtRelative(due);
                                                            const oppName = opp.name || opp.title || 'Untitled Opportunity';
                                                            return (
                                                                <Dropdown.Item key={`opp-${opp.id || opp._id}`} as={Link} to="/apps/opportunities">
                                                                    <div className="media">
                                                                        <div className="media-head">
                                                                            <div className={`avatar avatar-icon avatar-sm avatar-${overdue ? 'danger' : 'success'} avatar-rounded`}>
                                                                                <span className="initial-wrap">
                                                                                    <span className="feather-icon">
                                                                                        <TrendingUp />
                                                                                    </span>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="media-body">
                                                                            <div className="notifications-text">
                                                                                <strong>{oppName}</strong>
                                                                            </div>
                                                                            <div className="notifications-info">
                                                                                <HkBadge bg={overdue ? 'danger' : 'success'} soft>
                                                                                    {overdue ? 'Close date passed' : 'Closing soon'}
                                                                                </HkBadge>
                                                                                <div className="notifications-time">{label}</div>
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

                        {/* User dropdown */}
                        <Nav.Item>
                            <Dropdown className="ps-2">
                                <Dropdown.Toggle as={Link} to="#" className="no-caret">
                                    <div
                                        className="avatar avatar-primary avatar-rounded avatar-xs d-flex align-items-center justify-content-center text-white fw-bold"
                                        style={{ fontSize: 13 }}
                                    >
                                        {currentUser?.photo ? (
                                            <img
                                                src={currentUser.photo}
                                                alt={currentUser.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                            />
                                        ) : (
                                            <span className="initial-wrap">
                                                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                    <div className="p-2">
                                        <div className="media">
                                            <div className="media-head me-2">
                                                <div className="avatar avatar-primary avatar-sm avatar-rounded overflow-hidden">
                                                    {currentUser?.photo ? (
                                                        <img src={currentUser.photo} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span className="initial-wrap">
                                                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="media-body">
                                                <div className="fw-medium text-dark">{currentUser?.name || 'User'}</div>
                                                <div className="fs-7 text-muted">{currentUser?.email}</div>
                                                <span className={`badge badge-sm badge-soft-${currentUser?.role === 'admin' ? 'primary' : 'secondary'} mt-1`}>
                                                    {currentUser?.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Dropdown.Divider as="div" />
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
            </Container>
        </Navbar>

        {/* ═══════════════════════════════════════════════════════════════════
            ACTIVITY ALERT MODAL — fires when a scheduled activity becomes due
        ═══════════════════════════════════════════════════════════════════ */}
        {currentAlert && (() => {
            const meta = ACTIVITY_META[currentAlert.type] || ACTIVITY_META.Meeting;
            const dateLabel = fmtActivityDate(currentAlert.date, currentAlert.time);
            const queueLen  = alertQueue.length;
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
                                <HkBadge bg="secondary" soft className="ms-1">{queueLen} pending</HkBadge>
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
                            <span className="fs-7 text-muted">{dateLabel}</span>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="py-2 gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={dismissAlert}>
                            <X size={13} className="me-1" />Dismiss
                        </Button>
                        <Button
                            variant={meta.bg === 'warning' ? 'warning' : `${meta.bg}`}
                            size="sm"
                            as={Link}
                            to="/apps/calendar"
                            onClick={dismissAlert}
                        >
                            <Calendar size={13} className="me-1" />View Calendar
                        </Button>
                    </Modal.Footer>
                </Modal>
            );
        })()}
        </>
    );
};

const mapStateToProps = ({ theme, auth, tasks, opportunities, activities }) => ({
    navCollapsed: theme.navCollapsed,
    currentUser: auth.currentUser,
    tasks: tasks || [],
    opportunities: opportunities || [],
    activities: activities || [],
});

export default connect(mapStateToProps, { toggleCollapsedNav, logoutUser })(CompactNav);
