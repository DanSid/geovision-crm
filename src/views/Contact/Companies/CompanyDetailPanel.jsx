import React, { useState } from 'react';
import { Badge, Button, Nav, Tab, Table } from 'react-bootstrap';
import { Trash2 } from 'react-feather';
import { connect } from 'react-redux';
import { updateCompany, deleteCompany, updateContact } from '../../../redux/action/Crm';
import EntityTabSet from '../shared/EntityTabSet';
import AddSelectContactsModal from '../shared/AddSelectContactsModal';
import CompanyForm from './CompanyForm';

const CompanyDetailPanel = ({ companyId, companies, contacts, updateCompany, deleteCompany, updateContact }) => {
    const [showAddContacts, setShowAddContacts] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [profileEdit, setProfileEdit] = useState(false);

    const company = companies.find(c => String(c.id) === String(companyId));
    if (!company) {
        return (
            <div className="flex-1 d-flex align-items-center justify-content-center text-muted">
                <div className="text-center">
                    <p className="fs-5 mb-1">Select a company</p>
                    <p className="fs-7">Choose a company from the list to view its details</p>
                </div>
            </div>
        );
    }

    const companyContacts = contacts.filter(c => String(c.companyId) === String(companyId));
    const setProfileField = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

    const handleAddContacts = (ids) => {
        ids.forEach(cid => {
            const contact = contacts.find(c => c.id === cid);
            if (contact) updateContact({ ...contact, companyId });
        });
    };

    const handleRemoveContact = (contact) => {
        updateContact({ ...contact, companyId: null });
    };

    const handleSaveProfile = () => {
        updateCompany({ ...company, ...editForm });
        setEditForm(null);
        setProfileEdit(false);
    };

    const profileTab = (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">Company Profile</h6>
                {!profileEdit ? (
                    <Button size="sm" variant="outline-primary" onClick={() => { setEditForm({ ...company }); setProfileEdit(true); }}>
                        Edit Profile
                    </Button>
                ) : (
                    <div className="d-flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => { setEditForm(null); setProfileEdit(false); }}>Cancel</Button>
                        <Button size="sm" variant="primary" onClick={handleSaveProfile}>Save</Button>
                    </div>
                )}
            </div>
            {profileEdit ? (
                <CompanyForm form={editForm} set={setProfileField} />
            ) : (
                <div className="row g-2">
                    {[
                        ['Name', company.name], ['Phone', company.phone], ['Fax', company.fax],
                        ['Toll-Free', company.tollFree], ['Website', company.website], ['Ticker', company.ticker],
                        ['Industry', company.industry], ['Status', company.status],
                        ['Address', [company.address1, company.address2, company.city, company.county, company.post, company.country].filter(Boolean).join(', ')],
                        ['Description', company.description], ['Referred By', company.referredBy],
                    ].map(([label, val]) => val ? (
                        <div key={label} className="col-md-6">
                            <div className="d-flex gap-2">
                                <span className="text-muted fs-7" style={{ minWidth: 90 }}>{label}</span>
                                <span className="fs-7 fw-medium">{val}</span>
                            </div>
                        </div>
                    ) : null)}
                </div>
            )}
        </div>
    );

    const contactsTab = (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-muted fs-7">{companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''}</h6>
                <Button size="sm" variant="primary" onClick={() => setShowAddContacts(true)}>
                    Add/Remove Contacts
                </Button>
            </div>
            {companyContacts.length === 0 ? (
                <div className="text-center py-4 text-muted fs-7">No contacts linked to this company yet.</div>
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
                            {companyContacts.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="avatar avatar-xs avatar-rounded d-flex align-items-center justify-content-center text-white fw-bold"
                                            style={{ background: '#4f46e5', width: 26, height: 26, minWidth: 26, fontSize: 11 }}>
                                            {(c.firstName || '?').charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="fw-medium fs-7">{`${c.firstName || ''} ${c.lastName || ''}`.trim()}</td>
                                    <td className="fs-7">{company.name}</td>
                                    <td className="fs-7">{c.phone || '—'}</td>
                                    <td className="fs-7">{c.email}</td>
                                    <td className="fs-7">{c.department || '—'}</td>
                                    <td>
                                        <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded p-1"
                                            onClick={() => handleRemoveContact(c)}>
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
                currentIds={companyContacts.map(c => c.id)}
                onSelect={handleAddContacts}
                title="Add Contacts to Company"
            />
        </div>
    );

    const extraTabs = [
        { eventKey: 'contacts', label: 'Contacts', component: contactsTab },
        { eventKey: 'profile', label: 'Company Profile', component: profileTab },
    ];

    return (
        <div className="d-flex flex-column h-100 flex-1">
            {/* Company header */}
            <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between bg-white">
                <div>
                    <h5 className="mb-0 fw-semibold">{company.name}</h5>
                    {company.industry && (
                        <Badge bg="light" text="dark" className="border fs-8 mt-1">{company.industry}</Badge>
                    )}
                </div>
                <div className="d-flex gap-2">
                    {company.status && (
                        <Badge bg={company.status === 'Active' ? 'success' : company.status === 'Customer' ? 'primary' : 'secondary'}>
                            {company.status}
                        </Badge>
                    )}
                    <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded p-1"
                        onClick={() => deleteCompany(companyId)}>
                        <Trash2 size={15} />
                    </Button>
                </div>
            </div>

            {/* Sub-tabs */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
                <EntityTabSet
                    entityType="company"
                    entityId={companyId}
                    extraTabs={extraTabs}
                    defaultTab="contacts"
                />
            </div>
        </div>
    );
};

const mapStateToProps = ({ companies, contacts }) => ({ companies, contacts });
export default connect(mapStateToProps, { updateCompany, deleteCompany, updateContact })(CompanyDetailPanel);
