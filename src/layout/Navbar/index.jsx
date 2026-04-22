import React, { useMemo } from 'react';
import SimpleBar from 'simplebar-react';
import { AlignLeft, Bell, Calendar, CheckSquare, Clock, Settings, Tag, TrendingUp } from 'react-feather';
import { Button, Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
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

const CompactNav = ({ navCollapsed, toggleCollapsedNav, currentUser, logoutUser, tasks = [], opportunities = [] }) => {
    const { theme } = useTheme();

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

    /* ── Opportunity deadline notifications (close within 7 days, not already closed) ── */
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

    const notifCount = dueNotifications.length + oppNotifications.length;

    return (
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

                        {/* Notifications */}
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

                                    <SimpleBar className="dropdown-body p-2" style={{ maxHeight: 400 }}>
                                        {dueNotifications.length === 0 && oppNotifications.length === 0 ? (
                                            <div className="text-center py-4 text-muted fs-7">
                                                <span className="feather-icon d-block mb-2"><CheckSquare size={28} /></span>
                                                Everything is on track!
                                            </div>
                                        ) : (
                                            <>
                                                {/* ── Task notifications ── */}
                                                {dueNotifications.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1 text-muted fs-8 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>Tasks</div>
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
                                        <Link to="/apps/tasks/task-list">
                                            <u>View all tasks</u>
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
    );
};

const mapStateToProps = ({ theme, auth, tasks, opportunities }) => ({
    navCollapsed: theme.navCollapsed,
    currentUser: auth.currentUser,
    tasks: tasks || [],
    opportunities: opportunities || [],
});

export default connect(mapStateToProps, { toggleCollapsedNav, logoutUser })(CompactNav);
