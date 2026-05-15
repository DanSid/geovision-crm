import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    LayoutDashboard, CalendarEvent, ClipboardList, ChartBar,
    Timeline, BuildingStore, Users, Plus, Download,
} from 'tabler-icons-react';
import { addEvent, updateEvent, deleteEvent } from '../../redux/action/Crm';
import EventModal from './EventModal';
import EventsOverview from './EventsOverview';
import EventsTable from './EventsTable';
import EventsPlanning from './EventsPlanning';
import EventsAnalytics from './EventsAnalytics';
import EventsTimeline from './EventsTimeline';
import EventsVendors from './EventsVendors';
import EventsTeam from './EventsTeam';

const TABS = [
    { key: 'overview',  label: 'Overview',   icon: LayoutDashboard },
    { key: 'events',    label: 'Events',      icon: CalendarEvent },
    { key: 'planning',  label: 'Planning',    icon: ClipboardList },
    { key: 'analytics', label: 'Analytics',   icon: ChartBar },
];

const OPS_TABS = [
    { key: 'timeline', label: 'Timeline', icon: Timeline },
    { key: 'vendors',  label: 'Vendors',  icon: BuildingStore },
    { key: 'team',     label: 'Team',     icon: Users },
];

const TAB_TITLES = {
    overview:  'Overview',
    events:    'Events',
    planning:  'Planning',
    analytics: 'Analytics',
    timeline:  'Operations · Timeline',
    vendors:   'Operations · Vendors',
    team:      'Operations · Team',
};

const EventsApp = ({ events, clientOptions, onAdd, onUpdate, onDelete }) => {
    const [tab, setTab]         = useState('overview');
    const [modalOpen, setModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const openAdd  = () => { setEditing(null); setModal(true); };
    const openEdit = (ev) => { setEditing(ev); setModal(true); };
    const closeModal = () => { setModal(false); setEditing(null); };

    const handleSave = (form) => {
        if (editing) {
            onUpdate({ ...editing, ...form });
        } else {
            onAdd(form);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this event? This cannot be undone.')) return;
        onDelete(id);
        closeModal();
    };

    const handleEventClick = (ev) => {
        setTab('events');
    };

    const exportCSV = () => {
        const header = ['Name','Date','Venue','Lead','Status','Budget','BudgetStatus','Client','Team','Deliverables','Progress%'];
        const rows = events.map(e => [
            e.name, e.date, e.venue, e.lead, e.status,
            e.budget || '', e.budgetStatus || '', e.client || '',
            e.team || '',
            (e.deliverables || []).length,
            `${(e.deliverables || []).length
                ? Math.round((e.deliverables || []).filter(d => d.status === 'completed').length / (e.deliverables || []).length * 100)
                : 0}%`,
        ]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        a.download = 'geovision_events.csv';
        a.click();
    };

    const allTabs = [...TABS, ...OPS_TABS];
    const currentTab = allTabs.find(t => t.key === tab);

    return (
        <div className="hk-pg-wrapper pb-10">
            <div className="hk-pg-header">
                <div className="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
                    <div>
                        <h4 className="hk-pg-title fw-bold mb-0">Events &amp; Special Projects</h4>
                        <p className="mb-0" style={{ fontSize: 12, color: '#6b7280' }}>
                            {TAB_TITLES[tab]} · Geovision Services
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={exportCSV}>
                            <Download size={13} className="me-1" /> Export
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={openAdd}>
                            <Plus size={13} className="me-1" /> New Event
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-navigation */}
            <div className="container-xxl">
                <div className="d-flex gap-1 flex-wrap mb-4 border-bottom pb-2">
                    {/* Main tabs */}
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.key}
                                className={`btn btn-sm d-flex align-items-center gap-1 ${tab === t.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                style={{ fontSize: 12 }}
                                onClick={() => setTab(t.key)}>
                                <Icon size={13} /> {t.label}
                                {t.key === 'events' && events.length > 0 && (
                                    <span className={`badge ms-1 ${tab === 'events' ? 'bg-white text-primary' : 'bg-primary'}`} style={{ fontSize: 10 }}>
                                        {events.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Separator */}
                    <span className="align-self-center text-muted mx-1" style={{ fontSize: 11 }}>Operations:</span>

                    {/* Operations sub-tabs */}
                    {OPS_TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.key}
                                className={`btn btn-sm d-flex align-items-center gap-1 ${tab === t.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                style={{ fontSize: 12 }}
                                onClick={() => setTab(t.key)}>
                                <Icon size={13} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div>
                    {tab === 'overview'  && <EventsOverview  events={events} onViewAll={() => setTab('events')} onEventClick={handleEventClick} />}
                    {tab === 'events'    && <EventsTable     events={events} onEdit={openEdit} />}
                    {tab === 'planning'  && <EventsPlanning  events={events} onUpdateEvent={onUpdate} />}
                    {tab === 'analytics' && <EventsAnalytics events={events} />}
                    {tab === 'timeline'  && <EventsTimeline  events={events} />}
                    {tab === 'vendors'   && <EventsVendors   events={events} />}
                    {tab === 'team'      && <EventsTeam      events={events} />}
                </div>
            </div>

            {/* Add / Edit Modal */}
            <EventModal
                show={modalOpen}
                onHide={closeModal}
                event={editing}
                onSave={handleSave}
                onDelete={handleDelete}
                clientOptions={clientOptions}
            />
        </div>
    );
};

const mapState = (state) => {
    const opportunities = state.opportunities || [];
    const clientSet = new Set();
    opportunities.forEach(o => {
        if (o.name?.trim())    clientSet.add(o.name.trim());
        if (o.company?.trim()) clientSet.add(o.company.trim());
    });
    return {
        events:        state.events || [],
        clientOptions: [...clientSet].sort(),
    };
};
const mapDispatch = (dispatch) => ({
    onAdd:    (data) => dispatch(addEvent(data)),
    onUpdate: (data) => dispatch(updateEvent(data)),
    onDelete: (id)   => dispatch(deleteEvent(id)),
});

export default connect(mapState, mapDispatch)(EventsApp);
