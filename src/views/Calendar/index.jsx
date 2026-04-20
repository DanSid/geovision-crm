import React, { createRef, useMemo, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import classNames from 'classnames';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { useWindowHeight } from '@react-hook/window-size';
import { connect } from 'react-redux';
import { toggleTopNav } from '../../redux/action/Theme';
import { ChevronDown, ChevronUp } from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CalendarSidebar from './CalendarSidebar';
import EventsDrawer from './EventsDrawer';
import CreateNewEvent from './CreateNewEvent';
import { activitiesToCalendarEvents, opportunitiesToCalendarEvents, tasksToCalendarEvents } from '../../utils/taskData';
import { STORAGE_KEYS, loadStorage } from '../../utils/crmData';

const Calendar = ({ topNavCollapsed, toggleTopNav, tasks = [], opportunities = [] }) => {
  const calendarRef = createRef();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEventInfo, setShowEventInfo] = useState(false);
  const [createEvent, setCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 16));
  const [date, setDate] = useState(moment());
  const [currentView, setCurrentView] = useState('month');
  const height = useWindowHeight();

  const events = useMemo(() => {
    const activities = loadStorage(STORAGE_KEYS.activities, []);
    return [...tasksToCalendarEvents(tasks), ...opportunitiesToCalendarEvents(opportunities), ...activitiesToCalendarEvents(activities)];
  }, [tasks, opportunities]);

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

  return (
    <>
      <div className="hk-pg-body py-0">
        <div className={classNames('calendarapp-wrap', { 'calendarapp-sidebar-toggle': !showSidebar })}>
          <CalendarSidebar showSidebar={showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} createNewEvent={() => setCreateEvent(true)} />
          <div className="calendarapp-content">
            <div id="calendar" className="w-100">
              <header className="cd-header">
                <div className="d-flex flex-1 justify-content-start">
                  <Button variant="outline-light me-3" onClick={() => handleChange('today')}>Today</Button>
                  <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleChange('prev')}><span className="icon"><FontAwesomeIcon icon={faChevronLeft} size="sm" /></span></Button>
                  <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleChange('next')}><span className="icon"><FontAwesomeIcon icon={faChevronRight} size="sm" /></span></Button>
                </div>
                <div className="d-flex flex-1 justify-content-center"><h4 className="mb-0">{moment(date).format('MMMM YYYY')}</h4></div>
                <div className="cd-options-wrap d-flex flex-1 justify-content-end">
                  <ButtonGroup className="d-none d-md-flex">
                    {['month', 'week', 'day', 'list'].map((view) => <Button key={view} variant="outline-light" onClick={() => handleView(view)} active={currentView === view}>{view}</Button>)}
                  </ButtonGroup>
                  <Button as="a" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable" onClick={() => toggleTopNav(!topNavCollapsed)}><span className="icon"><span className="feather-icon">{topNavCollapsed ? <ChevronDown /> : <ChevronUp />}</span></span></Button>
                </div>
                <div className={classNames('hk-sidebar-togglable', { active: !showSidebar })} onClick={() => setShowSidebar(!showSidebar)} />
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
                dateClick={(info) => { setSelectedDate(`${info.dateStr}T09:00`); setCreateEvent(true); }}
                eventClick={(info) => { setSelectedEvent(info.event); setShowEventInfo(true); }}
              />
            </div>
          </div>
        </div>
      </div>
      <EventsDrawer show={showEventInfo} onClose={() => setShowEventInfo(false)} eventData={selectedEvent} />
      <CreateNewEvent show={createEvent} hide={() => setCreateEvent(false)} initialDate={selectedDate} />
    </>
  );
};

const mapState = ({ theme, tasks, opportunities }) => ({ topNavCollapsed: theme.topNavCollapsed, tasks, opportunities });
export default connect(mapState, { toggleTopNav })(Calendar);
