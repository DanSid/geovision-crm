import React, { useMemo, useState } from 'react';
import SimpleBar from 'simplebar-react';
import DatePicker from 'react-datepicker';
import { Archive, Bell, Book, Calendar, Plus, Settings } from 'react-feather';
import { Badge, Button, Dropdown, Form, Nav } from 'react-bootstrap';
import { connect } from 'react-redux';
import AddCategory from './AddCategory';
import SetReminder from './SetReminder';
import "react-datepicker/dist/react-datepicker.css";
import HkTooltip from '../../components/@hk-tooltip/HkTooltip';
import { STORAGE_KEYS, loadStorage } from '../../utils/crmData';

/* ── Upcoming event colour by type ── */
const eventDotColor = (type) => {
    if (type === 'Meeting')     return 'violet';
    if (type === 'Call')        return 'primary';
    if (type === 'opportunity') return 'success';
    return 'warning';
};

/* ── Format a date relative to today ── */
const relativeDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((dStart - todayStart) / 86400000);
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diff === 0) return `Today, ${timeStr}`;
    if (diff === 1) return `Tomorrow, ${timeStr}`;
    if (diff > 1 && diff < 7) return `${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${timeStr}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
};

const CalendarSidebar = ({ showSidebar, toggleSidebar, createNewEvent, activities = [], opportunities = [] }) => {
    const [addCategory, setAddCategory] = useState(false);
    const [reminder, setReminder]       = useState(false);
    const [startDate, setStartDate]     = useState(new Date());

    /* ── Compute upcoming events (next 4, sorted by date) ── */
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        const allEvents = [];

        // Activities
        activities.forEach(a => {
            const d = new Date(a.date || a.start || a.createdAt);
            if (d >= now) allEvents.push({ date: d, title: a.title || `${a.type} activity`, type: a.type || 'Meeting' });
        });

        // Opportunities closing soon
        opportunities.forEach(o => {
            const d = new Date(o.expectedCloseDate || o.closeDate);
            if (d >= now && !['Closed Won', 'Closed Lost'].includes(o.stage)) {
                allEvents.push({ date: d, title: `Close: ${o.name}`, type: 'opportunity' });
            }
        });

        return allEvents
            .sort((a, b) => a.date - b.date)
            .slice(0, 4);
    }, [activities, opportunities]);

    return (
        <>
            <nav className="calendarapp-sidebar">
                <SimpleBar className="nicescroll-bar">
                    <div className="menu-content-wrap">
                        <Dropdown>
                            <Dropdown.Toggle variant="primary" className="btn-rounded btn-block">Create</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={createNewEvent}>
                                    <span className="feather-icon dropdown-icon"><Calendar /></span>
                                    <span>Create an Event</span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => setReminder(!reminder)}>
                                    <span className="feather-icon dropdown-icon"><Bell /></span>
                                    <span>Set a Reminder</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* ── Mini date picker ── */}
                        <div className="text-center mt-4">
                            <div id="inline_calendar" className="d-inline-block">
                                <DatePicker
                                    selected={startDate}
                                    onChange={([start]) => setStartDate(start)}
                                    dateFormatCalendar="MMM yyyy"
                                    selectsRange
                                    inline
                                />
                            </div>
                        </div>

                        <div className="separator separator-light" />

                        {/* ── Upcoming Events ── */}
                        <div className="title-sm text-primary">Upcoming Events</div>
                        <div className="upcoming-event-wrap">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-muted fs-7 mb-0 px-1">No upcoming events.</p>
                            ) : (
                                <Nav as="ul" className="nav-light navbar-nav flex-column">
                                    {upcomingEvents.map((ev, i) => (
                                        <Nav.Item as="li" key={i}>
                                            <Nav.Link>
                                                <div className="d-flex align-items-center">
                                                    <Badge
                                                        bg={eventDotColor(ev.type)}
                                                        className="badge-indicator badge-indicator-lg me-2"
                                                    />
                                                    <span className="event-time">{relativeDate(ev.date.toISOString())}</span>
                                                </div>
                                                <div className="event-name">{ev.title}</div>
                                            </Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            )}
                        </div>

                        <div className="separator separator-light" />

                        {/* ── Categories ── */}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="title-sm text-primary mb-0">Categories</div>
                            <Button size="xs" variant="light" className="btn-icon btn-rounded" onClick={() => setAddCategory(!addCategory)}>
                                <HkTooltip id="tt-cal-add-cat" placement="top" title="Add Category">
                                    <span className="feather-icon"><Plus /></span>
                                </HkTooltip>
                            </Button>
                        </div>
                        <div className="categories-wrap">
                            <Form.Check id="cat-meetings"     type="checkbox" label="Meetings"     defaultChecked />
                            <Form.Check id="cat-calls"        type="checkbox" label="Calls"        defaultChecked />
                            <Form.Check id="cat-opps"         type="checkbox" label="Opportunities" defaultChecked />
                            <Form.Check id="cat-tasks"        type="checkbox" label="Tasks"        defaultChecked />
                            <Form.Check id="cat-conferences"  type="checkbox" label="Conferences" />
                        </div>
                    </div>
                </SimpleBar>

                {/* Fixed bottom nav */}
                <div className="calendarapp-fixednav">
                    <div className="hk-toolbar">
                        <Nav className="nav-light">
                            <Nav.Item className="nav-link">
                                <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                    <HkTooltip id="tt-cal-settings" placement="top" title="Settings">
                                        <span className="icon"><span className="feather-icon"><Settings /></span></span>
                                    </HkTooltip>
                                </Button>
                            </Nav.Item>
                            <Nav.Item className="nav-link">
                                <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                    <HkTooltip id="tt-cal-archive" placement="top" title="Archive">
                                        <span className="icon"><span className="feather-icon"><Archive /></span></span>
                                    </HkTooltip>
                                </Button>
                            </Nav.Item>
                            <Nav.Item className="nav-link">
                                <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                    <HkTooltip id="tt-cal-help" placement="top" title="Help">
                                        <span className="icon"><span className="feather-icon"><Book /></span></span>
                                    </HkTooltip>
                                </Button>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
            </nav>

            <AddCategory show={addCategory} hide={() => setAddCategory(!addCategory)} />
            <SetReminder show={reminder} hide={() => setReminder(!reminder)} />
        </>
    );
};

const mapState = ({ activities = [], opportunities = [] }) => ({ activities, opportunities });
export default connect(mapState)(CalendarSidebar);
