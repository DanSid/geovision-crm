import React from 'react';
import { Nav, Tab } from 'react-bootstrap';
import ActivitiesTab from '../ContactDetail/tabs/ActivitiesTab';
import OpportunitiesTab from '../ContactDetail/tabs/OpportunitiesTab';
import HistoryTab from '../ContactDetail/tabs/HistoryTab';
import NotesTab from '../ContactDetail/tabs/NotesTab';
import DocumentsTab from '../ContactDetail/tabs/DocumentsTab';

/**
 * Reusable tabset for contact/company/group detail views.
 * Props:
 *   entityType: 'contact' | 'company' | 'group'
 *   entityId: number
 *   contactName?: string  (for legacy opportunity matching)
 *   extraTabs?: Array<{ eventKey, label, component }>
 *   defaultTab?: string
 */
const EntityTabSet = ({ entityType, entityId, contactName, extraTabs = [], defaultTab = 'activities' }) => {
    return (
        <Tab.Container defaultActiveKey={defaultTab}>
            <div className="border-bottom mb-0">
                <Nav variant="tabs" className="nav-light flex-nowrap overflow-auto" style={{ flexWrap: 'nowrap' }}>
                    <Nav.Item>
                        <Nav.Link eventKey="activities" className="fs-7">Activities</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="opportunities" className="fs-7">Opportunities</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="history" className="fs-7">History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="notes" className="fs-7">Notes</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="documents" className="fs-7">Documents</Nav.Link>
                    </Nav.Item>
                    {extraTabs.map(t => (
                        <Nav.Item key={t.eventKey}>
                            <Nav.Link eventKey={t.eventKey} className="fs-7">{t.label}</Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>
            </div>
            <Tab.Content className="p-3">
                <Tab.Pane eventKey="activities">
                    <ActivitiesTab entityType={entityType} entityId={entityId} />
                </Tab.Pane>
                <Tab.Pane eventKey="opportunities">
                    <OpportunitiesTab entityType={entityType} entityId={entityId} contactName={contactName} />
                </Tab.Pane>
                <Tab.Pane eventKey="history">
                    <HistoryTab entityType={entityType} entityId={entityId} />
                </Tab.Pane>
                <Tab.Pane eventKey="notes">
                    <NotesTab entityType={entityType} entityId={entityId} />
                </Tab.Pane>
                <Tab.Pane eventKey="documents">
                    <DocumentsTab entityType={entityType} entityId={entityId} />
                </Tab.Pane>
                {extraTabs.map(t => (
                    <Tab.Pane key={t.eventKey} eventKey={t.eventKey}>
                        {t.component}
                    </Tab.Pane>
                ))}
            </Tab.Content>
        </Tab.Container>
    );
};

export default EntityTabSet;
