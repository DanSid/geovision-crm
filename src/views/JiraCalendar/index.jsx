import React, { createRef, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, ButtonGroup, Form, Nav, Toast, ToastContainer } from 'react-bootstrap';
import classNames from 'classnames';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { useWindowHeight } from '@react-hook/window-size';
import { connect } from 'react-redux';
import SimpleBar from 'simplebar-react';
import DatePicker from 'react-datepicker';
import { AlertCircle, Bell, CheckCircle, ChevronLeft, ChevronRight, Plus } from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { toggleTopNav } from '../../redux/action/Theme';
import { tasksToCalendarEvents } from '../../utils/taskData';
import "react-datepicker/dist/react-datepicker.css";

/* ── Priority config ───────────────────────────────────────────────────────── */
const PRIORITY_COLORS = { Urgent: 'danger', High: 'orange', Medium: 'warning', Low: 'secondary' };
const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];

/* ── Helper: is a task overdue? ─────────────────────────────────────────────── */
const isOverdue = (task) => {
    if (task.done || task.status === 'Completed') return false;
    const due = new Date(task.dueDate || task.end || task.start);
    return due < new Date();
};

/* ── Helper: relative date label ────────────────────────────────────────────── */
const relativeDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    if (diff < 0) return `Overdue ${Math.abs(diff)}d`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

/* ══════════════════════════════════════════════════════════════════════════════
   JiraCalendar — Tasks-only calendar with overdue notifications
══════════════════════════════════════════════════════════════════════════════ */
const JiraCalendar = ({ topNavCollapsed, toggleTopNav, tasks = [] }) => {
    const calendarRef = createRef();
    const [showSidebar, setShowSidebar] = useState(true);
    const [date, setDate]               = useState(moment());
    const [currentView, setCurrentView] = useState('month');
    const [pickerDate, setPickerDate]   = useState(new Date());
    const [toasts, setToasts]           = useState([]);            // overdue notifications
    const [shownNotifs, setShownNotifs] = useState(false);
    const height = useWindowHeight();

    /* ── Active priority filters ── */
    const [activeFilters, setActiveFilters] = useState({
        Urgent: true, High: true, Medium: true, Low: true,
    });
    const toggleFilter = (p) => setActiveFilters(f => ({ ...f, [p]: !f[p] }));

    /* ── Calendar events (filtered by priority) ── */
    const events = useMemo(() =>
        tasksToCalendarEvents(
            tasks.filter(t => activeFilters[t.priority] !== false)
        ),
    [tasks, activeFilters]);

    /* ── Upcoming incomplete tasks (next 5 by due date) ── */
    const upcomingTasks = useMemo(() => {
        const now = new Date();
        return [...tasks]
            .filter(t => !t.done && t.status !== 'Completed')
            .sort((a, b) => new Date(a.dueDate || a.end || 0) - new Date(b.dueDate || b.end || 0))
            .slice(0, 5);
    }, [tasks]);

    /* ── Overdue tasks ── */
    const overdueTasks = useMemo(() => tasks.filter(isOverdue), [tasks]);

    /* ── Show overdue toast notifications once on mount ── */
    useEffect(() => {
        if (shownNotifs || overdueTasks.length === 0) return;
        const notifs = overdueTasks.slice(0, 3).map(t => ({
            id: t.id,
            title: t.title,
            due: t.dueDate || t.end,
            priority: t.priority || 'Medium',
        }));
        setToasts(notifs);
        setShownNotifs(true);
    }, [overdueTasks, shownNotifs]);

    /* ── Calendar navigation ── */
    const handleChange = (action) => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        if (action === 'prev') api.prev();
        else if (action === 'next') api.next();
        else api.today();
        setDate(moment(api.getDate()));
    };

    const handleView = (view) => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        const viewMap = { month: 'dayGridMonth', week: 'timeGridWeek', day: 'timeGridDay', list: 'listWeek' };
        api.changeView(viewMap[view]);
        setCurrentView(view);
        setDate(moment(api.getDate()));
    };

    /* ════════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════════ */
    return (
        <>
            {/* ── Overdue toast notifications ── */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                {toasts.map(t => (
                    <Toast
                        key={t.id}
                        onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                        show
                        delay={8000}
                        autohide
                        bg="danger"
                    >
                        <Toast.Header>
                            <AlertCircle size={14} className="me-2 text-danger" />
                            <strong className="me-auto text-danger">Overdue Task</strong>
                            <small>{relativeDate(t.due)}</small>
                        </Toast.Header>
                        <Toast.Body className="text-white">
                            <strong>{t.title}</strong>
                            <div style={{ fontSize: 11 }}>Priority: {t.priority}</div>
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>

            <div className="hk-pg-body py-0">
                <div className={classNames('calendarapp-wrap', { 'calendarapp-sidebar-toggle': !showSidebar })}>

                    {/* ══════════════════════════════════
                        SIDEBAR
                    ══════════════════════════════════ */}
                    <nav className="calendarapp-sidebar">
                        <SimpleBar className="nicescroll-bar">
                            <div className="menu-content-wrap">

                                {/* Mini date picker */}
                                <div className="text-center mt-2">
                                    <div className="d-inline-block">
                                        <DatePicker
                                            selected={pickerDate}
                                            onChange={([d]) => { if (d) setPickerDate(d); }}
                                            dateFormatCalendar="MMM yyyy"
                                            selectsRange
                                            inline
                                        />
                                    </div>
                                </div>

                                <div className="separator separator-light" />

                                {/* ── Overdue alert ── */}
                                {overdueTasks.length > 0 && (
                                    <div
                                        className="d-flex align-items-center gap-2 px-2 py-2 mb-3 rounded"
                                        style={{ background: 'rgba(220,53,69,0.12)', border: '1px solid rgba(220,53,69,0.3)' }}
                                    >
                                        <AlertCircle size={16} className="text-danger flex-shrink-0" />
                                        <div>
                                            <div className="fw-semibold text-danger" style={{ fontSize: 12 }}>
                                                {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: 11 }}>
                                                Requires your attention
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Upcoming Tasks ── */}
                                <div className="title-sm text-primary">Upcoming Tasks</div>
                                <div className="upcoming-event-wrap">
                                    {upcomingTasks.length === 0 ? (
                                        <div className="d-flex align-items-center gap-2 py-2 text-muted fs-7">
                                            <CheckCircle size={14} className="text-success" />
                                            All tasks are up to date!
                                        </div>
                                    ) : (
                                        <Nav as="ul" className="nav-light navbar-nav flex-column">
                                            {upcomingTasks.map(task => (
                                                <Nav.Item as="li" key={task.id}>
                                                    <Nav.Link className="py-1 px-0">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Badge
                                                                bg={PRIORITY_COLORS[task.priority] || 'secondary'}
                                                                className="badge-indicator badge-indicator-lg flex-shrink-0"
                                                            />
                                                            <span
                                                                className={classNames('event-time', { 'text-danger': isOverdue(task) })}
                                                                style={{ fontSize: 11 }}
                                                            >
                                                                {relativeDate(task.dueDate || task.end)}
                                                            </span>
                                                        </div>
                                                        <div className="event-name text-truncate" style={{ maxWidth: 200, fontSize: 13 }}>
                                                            {task.title}
                                                        </div>
                                                    </Nav.Link>
                                                </Nav.Item>
                                            ))}
                                        </Nav>
                                    )}
                                </div>

                                <div className="separator separator-light" />

                                {/* ── Priority Categories (filters) ── */}
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="title-sm text-primary mb-0">Categories</div>
                                </div>
                                <div className="categories-wrap">
                                    {PRIORITIES.map(p => (
                                        <Form.Check
                                            key={p}
                                            id={`jira-cat-${p}`}
                                            type="checkbox"
                                            label={
                                                <span className="d-flex align-items-center gap-1">
                                                    <Badge bg={PRIORITY_COLORS[p]} style={{ fontSize: 9, padding: '2px 6px' }}>{p}</Badge>
                                                    <span style={{ fontSize: 13 }}>
                                                        {tasks.filter(t => t.priority === p).length} tasks
                                                    </span>
                                                </span>
                                            }
                                            checked={activeFilters[p]}
                                            onChange={() => toggleFilter(p)}
                                        />
                                    ))}
                                </div>

                                <div className="separator separator-light" />

                                {/* ── Stats ── */}
                                <div className="title-sm text-primary">Summary</div>
                                <div className="px-1 mb-2">
                                    {[
                                        { label: 'Total tasks', value: tasks.length, color: 'primary' },
                                        { label: 'Completed', value: tasks.filter(t => t.done || t.status === 'Completed').length, color: 'success' },
                                        { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'warning' },
                                        { label: 'Overdue', value: overdueTasks.length, color: 'danger' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                            <span className="fs-7 text-muted">{label}</span>
                                            <Badge bg={color} className="fw-normal">{value}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SimpleBar>
                    </nav>

                    {/* ══════════════════════════════════
                        CALENDAR MAIN
                    ══════════════════════════════════ */}
                    <div className="calendarapp-content">
                        <div id="jira-calendar" className="w-100">
                            <header className="cd-header">
                                <div className="d-flex flex-1 justify-content-start">
                                    <Button variant="outline-light me-3" onClick={() => handleChange('today')}>Today</Button>
                                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleChange('prev')}>
                                        <span className="icon"><FontAwesomeIcon icon={faChevronLeft} size="sm" /></span>
                                    </Button>
                                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleChange('next')}>
                                        <span className="icon"><FontAwesomeIcon icon={faChevronRight} size="sm" /></span>
                                    </Button>
                                </div>
                                <div className="d-flex flex-1 justify-content-center">
                                    <h4 className="mb-0">{moment(date).format('MMMM YYYY')}</h4>
                                </div>
                                <div className="cd-options-wrap d-flex flex-1 justify-content-end">
                                    <ButtonGroup className="d-none d-md-flex">
                                        {['month', 'week', 'day', 'list'].map(v => (
                                            <Button key={v} variant="outline-light" active={currentView === v} onClick={() => handleView(v)}>
                                                {v}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </div>
                                <div
                                    className={classNames('hk-sidebar-togglable', { active: !showSidebar })}
                                    onClick={() => setShowSidebar(!showSidebar)}
                                />
                            </header>

                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={false}
                                themeSystem="bootstrap"
                                height={height - 130}
                                editable={false}
                                selectable
                                events={events}
                                eventClick={(info) => {
                                    const task = info.event.extendedProps?.task;
                                    if (task) alert(`Task: ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}\nDue: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}`);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const mapState = ({ theme, tasks = [] }) => ({
    topNavCollapsed: theme?.topNavCollapsed,
    tasks,
});
export default connect(mapState, { toggleTopNav })(JiraCalendar);
