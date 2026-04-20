import React, { useState } from 'react';
import { Badge, Button, Table } from 'react-bootstrap';
import { Trash2 } from 'react-feather';
import { connect } from 'react-redux';
import { updateGroup, deleteGroup } from '../../../redux/action/Crm';
import EntityTabSet from '../shared/EntityTabSet';
import AddSelectContactsModal from '../shared/AddSelectContactsModal';

const GroupDetailPanel = ({ groupId, groups, contacts, opportunities, updateGroup, deleteGroup }) => {
    const [showAddContacts, setShowAddContacts] = useState(false);

    const group = groups.find(g => String(g.id) === String(groupId));
    if (!group) {
        return (
            <div className="flex-1 d-flex align-items-center justify-content-center text-muted">
                <div className="text-center">
                    <p className="fs-5 mb-1">Select a group</p>
                    <p className="fs-7">Choose a group from the list to view its details</p>
                </div>
            </div>
        );
    }

    const contactIds = group.contactIds || [];
    const groupContacts = contacts.filter(c => contactIds.includes(c.id));

    // Aggregate opportunities linked to group members
    const groupOpps = opportunities.filter(o =>
        contactIds.some(cid => String(o.contactId) === String(cid))
    );

    const handleAddContacts = (ids) => {
        const merged = [...new Set([...contactIds, ...ids])];
        updateGroup({ ...group, contactIds: merged });
    };

    const handleRemoveContact = (cid) => {
        updateGroup({ ...group, contactIds: contactIds.filter(id => id !== cid) });
    };

    const contactsTab = (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">{groupContacts.length} contact{groupContacts.length !== 1 ? 's' : ''}</h6>
                <Button size="sm" variant="primary" onClick={() => setShowAddContacts(true)}>
                    Add/Remove Contacts
                </Button>
            </div>
            {groupContacts.length === 0 ? (
                <div className="text-center py-4 text-muted fs-7">No contacts in this group yet.</div>
            ) : (
                <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th></th>
                                <th>Contact</th>
                                <th>Company</th>
                                <th>Phone</th>
                                <th>E-mail</th>
                                <th>Title</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupContacts.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="avatar avatar-xs avatar-rounded d-flex align-items-center justify-content-center text-white fw-bold"
                                            style={{ background: '#4f46e5', width: 26, height: 26, minWidth: 26, fontSize: 11 }}>
                                            {(c.firstName || '?').charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="fw-medium fs-7">{`${c.firstName || ''} ${c.lastName || ''}`.trim()}</td>
                                    <td className="fs-7">{c.company || '—'}</td>
                                    <td className="fs-7">{c.phone || '—'}</td>
                                    <td className="fs-7">{c.email}</td>
                                    <td className="fs-7">{c.department || '—'}</td>
                                    <td>
                                        <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded p-1"
                                            onClick={() => handleRemoveContact(c.id)}>
                                            <Trash2 size={13} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
            <AddSelectContactsModal
                show={showAddContacts}
                onHide={() => setShowAddContacts(false)}
                currentIds={contactIds}
                onSelect={handleAddContacts}
                title="Add Contacts to Group"
            />
        </div>
    );

    // Read-only opportunities aggregation tab
    const oppsTab = (
        <div>
            <h6 className="mb-3 text-muted fs-7">{groupOpps.length} opportunit{groupOpps.length !== 1 ? 'ies' : 'y'} across group members</h6>
            {groupOpps.length === 0 ? (
                <div className="text-center py-4 text-muted fs-7">No opportunities linked to this group's contacts.</div>
            ) : (
                <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Stage</th>
                                <th>Value</th>
                                <th>Close Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupOpps.map(o => (
                                <tr key={o.id}>
                                    <td className="fw-medium fs-7">{o.name}</td>
                                    <td className="fs-7">{o.company}</td>
                                    <td>
                                        <Badge bg={o.stage === 'Closed Won' ? 'success' : o.stage === 'Closed Lost' ? 'danger' : 'primary'}
                                            className="fw-normal fs-8">{o.stage}</Badge>
                                    </td>
                                    <td className="fs-7">{o.value ? `$${parseFloat(o.value).toLocaleString()}` : '—'}</td>
                                    <td className="fs-7">{o.closeDate ? new Date(o.closeDate).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );

    const extraTabs = [
        { eventKey: 'contacts', label: 'Contacts', component: contactsTab },
        { eventKey: 'group-opps', label: 'Opportunities', component: oppsTab },
    ];

    return (
        <div className="d-flex flex-column h-100 flex-1">
            <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between bg-white">
                <div>
                    <h5 className="mb-0 fw-semibold">{group.name}</h5>
                    {group.description && (
                        <p className="mb-0 text-muted fs-7 mt-1">{group.description}</p>
                    )}
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <Badge bg="light" text="dark" className="border">{contactIds.length} contacts</Badge>
                    <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded p-1"
                        onClick={() => deleteGroup(groupId)}>
                        <Trash2 size={15} />
                    </Button>
                </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
                <EntityTabSet
                    entityType="group"
                    entityId={groupId}
                    extraTabs={extraTabs}
                    defaultTab="contacts"
                />
            </div>
        </div>
    );
};

const mapStateToProps = ({ groups, contacts, opportunities }) => ({ groups, contacts, opportunities });
export default connect(mapStateToProps, { updateGroup, deleteGroup })(GroupDetailPanel);
