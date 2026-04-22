import React, { createRef, useEffect, useMemo, useState } from 'react';
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
import { AlertTriangle, CheckCircle, Tool, Truck, Users } from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { toggleTopNav } from '../../redux/action/Theme';
import "react-datepicker/dist/react-datepicker.css";

/* ── Type configs ─────────────────────────────────────────────────────────── */
const TYPE_COLORS = {
    repair:    '#dc3545',  // red
    inspection:'#0d6efd',  // blue
    lost:      '#fd7e14',  // orange
    inventory: '#6f42c1',  // purple
    request:   '#198754',  // green
};

const TYPE_BG = {
    repair:    'danger',
    inspection:'primary',
    lost:      'warning',
    inventory: 'info',
    request:   'success',
};

const TYPE_LABELS = {
    repair:    'Repairs',
    inspection:'Inspections',
    lost:      'Lost Equipment',
    inventory: 'Inventory Counts',
    request:   'Requests',
};

const ALL_TYPES = ['repair', 'inspection', 'lost', 'inventory', 'request'];

const STATUS_COLORS = {
    Pending: 'warning',
    'In Progress': 'info',
    Completed: 'success',
    Cancelled: 'secondary',
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const isOverdue = (record) => {
    if (record.status === 'Completed' || record.status === 'Cancelled') return false;
    const due = new Date(record.date || record.scheduledDate || record.requestDate);
    return !isNaN(due) && due < new Date();
};

const relativeDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const now = new Date();
    const diff = Math.round(
        (new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
         new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000
    );
    if (diff < 0) return `Overdue ${Math.abs(diff)}d`;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ── Convert logistics records to FullCalendar events ─────────────────────── */
const toCalendarEvents = (maintenance = [], requests = [], activeTypes = {}) => {
    const events = [];

    maintenance.forEach((r) => {
        if (!activeTypes[r.type]) return;
        const dateStr = r.date || r.scheduledDate;
        if (!dateStr) return;
        const overdue = isOverdue(r);
        events.push({
            id: `m-${r.id}`,
            title: r.title || `${TYPE_LABELS[r.type] || r.type} record`,
            date: dateStr.slice(0, 10),
            backgroundColor: overdue ? '#dc3545' : TYPE_COLORS[r.type] || '#6c757d',
            borderColor:     overdue ? '#b02a37' : TYPE_COLORS[r.type] || '#6c757d',
            textColor: '#fff',
            extendedProps: { record: r, kind: 'maintenance' },
        });
    });

    if (activeTypes['request']) {
        requests.forEach((r) => {
            const dateStr = r.requestDate || r.date || r.createdAt;
            if (!dateStr) return;
            const overdue = isOverdue({ ...r, date: dateStr });
            events.push({
                id: `r-${r.id}`,
                title: r.title || r.requestTitle || 'Request',
                date: dateStr.slice(0, 10),
                backgroundColor: overdue ? '#dc3545' : TYPE_COLORS.request,
                borderColor:     overdue ? '#b02a37' : TYPE_COLORS.request,
                textColor: '#fff',
                extendedProps: { record: r, kind: 'request' },
            });
        });
    }

    return events;
};

/* ══════════════════════════════════════════════════════════════════════════════
   LogisticsCalendar
══════════════════════════════════════════════════════════════════════════════ */
const LogisticsCalendar = ({ maintenance = [], requests = [], topNavCollapsed, toggleTopNav }) => {
    const calendarRef = createRef();
    const [showSidebar, setShowSidebar] = useState(true);
    const [date, setDate]               = useState(moment());
    const [currentView, setCurrentView] = useState('month');
    const [pickerDate, setPickerDate]   = useState(new Date());
    const [toasts, setToasts]           = useState([]);
    const [shownNotifs, setShownNotifs] = useState(false);
    const height = useWindowHeight();

    /* ── Active type filters ── */
    const [activeTypes, setActiveTypes] = useState({
        repair: true, inspection: true, lost: true, inventory: true, request: true,
    });
    const toggleType = (t) => setActiveTypes(f => ({ ...f, [t]: !f[t] }));

    /* ── Overdue records ── */
    const overdueRecords = useMemo(() => {
        const mOverdue = maintenance.filter(isOverdue);
        const rOverdue = requests.filter(r => isOverdue({ ...r, date: r.requestDate || r.date || r.createdAt }));
        return [...mOverdue, ...rOverdue];
    }, [maintenance, requests]);

    /* ── Upcoming records (next 5, incomplete) ── */
    const upcomingRecords = useMemo(() => {
        const now = new Date();
        const all = [
            ...maintenance.map(r => ({ ...r, _date: new Date(r.date || r.scheduledDate || 0), _label: TYPE_LABELS[r.type] || r.type })),
            ...requests.map(r => ({ ...r, _date: new Date(r.requestDate || r.date || r.createdAt || 0), _label: 'Request' })),
        ];
        return all
            .filter(r => r._date >= now && r.status !== 'Completed' && r.status !== 'Cancelled')
            .sort((a, b) => a._date - b._date)
            .slice(0, 5);
    }, [maintenance, requests]);

    /* ── Calendar events ── */
    const events = useMemo(
        () => toCalendarEvents(maintenance, requests, activeTypes),
        [maintenance, requests, activeTypes]
    );

    /* ── Show overdue toasts once on mount ── */
    useEffect(() => {
        if (shownNotifs || overdueRecords.length === 0) return;
        const notifs = overdueRecords.slice(0, 3).map(r => ({
            id: r.id,
            title: r.title || r.requestTitle || 'Logistics record',
            date: r.date || r.requestDate || r.createdAt,
            type: r.type || 'request',
        }));
        setToasts(notifs);
        setShownNotifs(true);
    }, [overdueRecords, shownNotifs]);

    /* ── Navigation ── */
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

    /* ── Stats ── */
    const stats = useMemo(() => {
        const allRecords = [
            ...maintenance,
            ...requests.map(r => ({ ...r, status: r.status || 'Pending' })),
        ];
        return {
            total:     allRecords.length,
            completed: allRecords.filter(r => r.status === 'Completed').length,
            pending:   allRecords.filter(r => r.status === 'Pending').length,
            overdue:   overdueRecords.length,
        };
    }, [maintenance, requests, overdueRecords]);

    /* ════════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════════ */
    return (
        <>
            {/* ── Overdue toast alerts ── */}
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
                            <AlertTriangle size={14} className="me-2 text-danger" />
                            <strong className="me-auto text-danger">Overdue Logistics Record</strong>
                            <small>{relativeDate(t.date)}</small>
                        </Toast.Header>
                        <Toast.Body className="text-white">
                            <strong>{t.title}</strong>
                            <div style={{ fontSize: 11 }}>Type: {TYPE_LABELS[t.type] || t.type}</div>
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>

            <div className="hk-pg-body py-0">
                <div className={classNames('calendarapp-wrap', { 'calendarapp-sidebar-toggle': !showSidebar })}>

                    {/* ══════════════════════
                        SIDEBAR
                    ══════════════════════ */}
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
                                {overdueRecords.length > 0 && (
                                    <div
                                        className="d-flex align-items-center gap-2 px-2 py-2 mb-3 rounded"
                                        style={{ background: 'rgba(220,53,69,0.12)', border: '1px solid rgba(220,53,69,0.3)' }}
                                    >
                                        <AlertTriangle size={16} className="text-danger flex-shrink-0" />
                                        <div>
                                            <div className="fw-semibold text-danger" style={{ fontSize: 12 }}>
                                                {overdueRecords.length} overdue record{overdueRecords.length !== 1 ? 's' : ''}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: 11 }}>
                                                Requires your attention
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Upcoming Records ── */}
                                <div className="title-sm text-primary">Upcoming</div>
                                <div className="upcoming-event-wrap">
                                    {upcomingRecords.length === 0 ? (
                                        <div className="d-flex align-items-center gap-2 py-2 text-muted fs-7">
                                            <CheckCircle size={14} className="text-success" />
                                            All records are up to date!
                                        </div>
                                    ) : (
                                        <Nav as="ul" className="nav-light navbar-nav flex-column">
                                            {upcomingRecords.map((r, i) => (
                                                <Nav.Item as="li" key={r.id || i}>
                                                    <Nav.Link className="py-1 px-0">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Badge
                                                                bg={TYPE_BG[r.type] || 'secondary'}
                                                                className="badge-indicator badge-indicator-lg flex-shrink-0"
                                                            />
                                                            <span className="text-muted" style={{ fontSize: 11 }}>
                                                                {relativeDate(r._date?.toISOString())}
                                                            </span>
                                                        </div>
                                                        <div className="text-truncate" style={{ maxWidth: 200, fontSize: 13 }}>
                                                            {r.title || r.requestTitle || 'Untitled'}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: 11 }}>
                                                            {r._label} · <Badge bg={STATUS_COLORS[r.status] || 'secondary'} style={{ fontSize: 9 }}>{r.status || 'Pending'}</Badge>
                                                        </div>
                                                    </Nav.Link>
                                                </Nav.Item>
                                            ))}
                                        </Nav>
                                    )}
                                </div>

                                <div className="separator separator-light" />

                                {/* ── Type filters ── */}
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="title-sm text-primary mb-0">Categories</div>
                                </div>
                                <div className="categories-wrap">
                                    {ALL_TYPES.map(t => (
                                        <Form.Check
                                            key={t}
                                            id={`log-cat-${t}`}
                                            type="checkbox"
                                            label={
                                                <span className="d-flex align-items-center gap-1">
                                                    <Badge bg={TYPE_BG[t]} style={{ fontSize: 9, padding: '2px 6px' }}>{TYPE_LABELS[t]}</Badge>
                                                    <span style={{ fontSize: 13 }}>
                                                        {t === 'request'
                                                            ? requests.length
                                                            : maintenance.filter(r => r.type === t).length} records
                                                    </span>
                                                </span>
                                            }
                                            checked={activeTypes[t]}
                                            onChange={() => toggleType(t)}
                                        />
                                    ))}
                                </div>

                                <div className="separator separator-light" />

                                {/* ── Summary stats ── */}
                                <div className="title-sm text-primary">Summary</div>
                                <div className="px-1 mb-2">
                                    {[
                                        { label: 'Total records', value: stats.total, color: 'primary' },
                                        { label: 'Completed',     value: stats.completed, color: 'success' },
                                        { label: 'Pending',       value: stats.pending, color: 'warning' },
                                        { label: 'Overdue',       value: stats.overdue, color: 'danger' },
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

                    {/* ══════════════════════
                        MAIN CALENDAR
                    ══════════════════════ */}
                    <div className="calendarapp-content">
                        <div id="logistics-calendar" className="w-100">
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
                                    const r = info.event.extendedProps?.record;
                                    if (!r) return;
                                    const typeLabel = TYPE_LABELS[r.type] || (r.requestTitle ? 'Request' : 'Record');
                                    alert(
                                        `${typeLabel}: ${r.title || r.requestTitle || 'Untitled'}\n` +
                                        `Status: ${r.status || 'N/A'}\n` +
                                        `Priority: ${r.priority || 'N/A'}\n` +
                                        `Equipment: ${r.equipmentName || 'N/A'}\n` +
                                        `Assigned To: ${r.assignedTo || 'N/A'}\n` +
                                        `Date: ${r.date || r.requestDate || r.scheduledDate || 'N/A'}`
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const mapState = ({ maintenance = [], requests = [], theme }) => ({
    maintenance,
    requests,
    topNavCollapsed: theme?.topNavCollapsed,
});

export default connect(mapState, { toggleTopNav })(LogisticsCalendar);
