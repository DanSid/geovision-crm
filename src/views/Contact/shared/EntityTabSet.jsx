import React from 'react';
import { Badge, Table } from 'react-bootstrap';
import { Nav, Tab } from 'react-bootstrap';
import { connect } from 'react-redux';
import ActivitiesTab from '../ContactDetail/tabs/ActivitiesTab';
import OpportunitiesTab from '../ContactDetail/tabs/OpportunitiesTab';
import HistoryTab from '../ContactDetail/tabs/HistoryTab';
import NotesTab from '../ContactDetail/tabs/NotesTab';
import DocumentsTab from '../ContactDetail/tabs/DocumentsTab';

/* ── Inline Companies/Groups summary tab ─────────────────────────────────── */
const CompaniesGroupsTab = ({ entityId, companies = [], groups = [] }) => {
    const myCompanies = companies.filter(c =>
        String(c.id) === String(entityId) ||
        String(c._id) === String(entityId) ||
        (c.contactIds && c.contactIds.includes(String(entityId)))
    );
    const myGroups = groups.filter(g =>
        g.memberIds && g.memberIds.includes(String(entityId))
    );

    return (
        <div className="row g-3">
            <div className="col-md-6">
                <h6 className="fw-semibold fs-7 text-muted mb-2">
                    <i className="ri-building-line me-1" />Companies
                </h6>
                {myCompanies.length === 0 ? (
                    <p className="text-muted fs-7">Not associated with any company.</p>
                ) : (
                    <Table size="sm" bordered hover className="fs-7 mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myCompanies.map(c => (
                                <tr key={c.id || c._id}>
                                    <td className="fw-medium">{c.name}</td>
                                    <td className="text-muted">{c.phone || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
            <div className="col-md-6">
                <h6 className="fw-semibold fs-7 text-muted mb-2">
                    <i className="ri-group-line me-1" />Groups
                </h6>
                {myGroups.length === 0 ? (
                    <p className="text-muted fs-7">Not a member of any group.</p>
                ) : (
                    <div className="d-flex flex-wrap gap-2">
                        {myGroups.map(g => (
                            <Badge key={g.id || g._id} bg="light" text="dark" className="border fw-normal fs-7 px-2 py-1">
                                <i className="ri-group-line me-1" />{g.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
const CompaniesGroupsTabConnected = connect(({ companies, groups }) => ({ companies, groups }))(CompaniesGroupsTab);

/* ════════════════════════════════════════════════════════════════════════════
   EntityTabSet
   Reusable tab set for contact / company / group detail views.

   Props:
     entityType   — 'contact' | 'company' | 'group'
     entityId     — string / number
     contactName? — for legacy opportunity matching
     extraTabs?   — Array<{ eventKey, label, component }>
     defaultTab?  — string  (default: 'activities')
════════════════════════════════════════════════════════════════════════════ */
const EntityTabSet = ({ entityType, entityId, contactName, extraTabs = [], defaultTab = 'activities' }) => {
    return (
        <Tab.Container defaultActiveKey={defaultTab}>
            {/* ── Tab nav ── */}
            <div className="border-bottom mb-0" style={{ background: '#fff' }}>
                <Nav
                    variant="tabs"
                    className="nav-light flex-nowrap"
                    style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none' }}
                >
                    <Nav.Item>
                        <Nav.Link eventKey="activities" className="fs-7 text-nowrap">
                            <i className="ri-pulse-line me-1" />Activities
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="opportunities" className="fs-7 text-nowrap">
                            <i className="ri-arrow-up-circle-line me-1" />Opportunities
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="history" className="fs-7 text-nowrap">
                            <i className="ri-history-line me-1" />History
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="notes" className="fs-7 text-nowrap">
                            <i className="ri-file-text-line me-1" />Notes
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="documents" className="fs-7 text-nowrap">
                            <i className="ri-attachment-2 me-1" />Documents
                        </Nav.Link>
                    </Nav.Item>
                    {entityType === 'contact' && (
                        <Nav.Item>
                            <Nav.Link eventKey="companies-groups" className="fs-7 text-nowrap">
                                <i className="ri-building-line me-1" />Companies / Groups
                            </Nav.Link>
                        </Nav.Item>
                    )}
                    {extraTabs.map(t => (
                        <Nav.Item key={t.eventKey}>
                            <Nav.Link eventKey={t.eventKey} className="fs-7 text-nowrap">{t.label}</Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>
            </div>

            {/* ── Tab panes ── */}
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
                {entityType === 'contact' && (
                    <Tab.Pane eventKey="companies-groups">
                        <CompaniesGroupsTabConnected entityId={entityId} />
                    </Tab.Pane>
                )}
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
