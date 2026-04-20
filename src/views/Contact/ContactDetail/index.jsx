import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { List, Grid } from 'react-feather';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactAppHeader from '../ContactAppHeader';
import ContactDetailTopPanels from './ContactDetailTopPanels';
import EntityTabSet from '../shared/EntityTabSet';
import SecondaryContactsTab from './tabs/SecondaryContactsTab';

const ContactDetail = ({ match, contacts }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const id = match.params.id;
    const contact = contacts.find(c => String(c.id) === String(id) || String(c._id) === String(id));
    const contactName = contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() : '';

    const extraTabs = [
        {
            eventKey: 'secondary',
            label: 'Secondary Contacts',
            component: <SecondaryContactsTab contactId={id} />,
        },
    ];

    return (
        <div className="hk-pg-body py-0">
            <div className={`contactapp-wrap ${showSidebar ? 'contactapp-sidebar-toggle' : ''}`}>
                <ContactAppSidebar />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        <ContactAppHeader
                            toggleSidebar={() => setShowSidebar(s => !s)}
                            show={showSidebar}
                        />

                        {!contact ? (
                            <div className="text-center py-5">
                                <h5 className="text-muted">Contact not found.</h5>
                                <Link to="/apps/contacts/contact-list" className="btn btn-primary btn-sm mt-2">
                                    Back to Contact List
                                </Link>
                            </div>
                        ) : (
                            <div className="d-flex flex-column h-100">
                                {/* Breadcrumb + View toggle bar */}
                                <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb mb-0">
                                            <li className="breadcrumb-item">
                                                <Link to="/apps/contacts/contact-list" className="text-primary fs-7">Contacts</Link>
                                            </li>
                                            <li className="breadcrumb-item active fs-7" aria-current="page">
                                                {contactName || 'Detail'}
                                            </li>
                                        </ol>
                                    </nav>
                                    <div className="d-flex gap-1">
                                        <Button
                                            as={Link}
                                            to="/apps/contacts/contact-list"
                                            variant="outline-secondary"
                                            size="sm"
                                            className="d-flex align-items-center gap-1"
                                        >
                                            <List size={14} />
                                            <span className="fs-7">List View</span>
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="d-flex align-items-center gap-1"
                                            disabled
                                        >
                                            <Grid size={14} />
                                            <span className="fs-7">Detail View</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* 4-panel top info */}
                                <ContactDetailTopPanels contact={contact} />

                                {/* Bottom sub-tabs */}
                                <div className="flex-1" style={{ overflowY: 'auto' }}>
                                    <EntityTabSet
                                        entityType="contact"
                                        entityId={id}
                                        contactName={contactName}
                                        extraTabs={extraTabs}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ contacts }) => ({ contacts });
export default connect(mapStateToProps)(ContactDetail);
