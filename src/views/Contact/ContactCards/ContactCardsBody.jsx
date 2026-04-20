import React, { useMemo, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Inbox, MoreVertical, Star, UserCheck } from 'react-feather';
import { Badge, Button, Card, Col, Dropdown, Form, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import ContactDetails from './ContactDetails';
import { filterContacts, formatContactSubtitle, getContactInitials, getContactLabels, getContactName, getContactStatus } from '../../../utils/contactWorkspace';

const ContactCardsBody = ({ contacts = [], activeFilter = 'all', activeLabel = 'all' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredContacts = useMemo(() => filterContacts(contacts, searchTerm, activeFilter, activeLabel), [contacts, searchTerm, activeFilter, activeLabel]);
    const multipleSelection = selectedIds.length > 0;

    const toggleCheck = (contactId) => {
        setSelectedIds(current => current.includes(contactId) ? current.filter(id => id !== contactId) : [...current, contactId]);
    };

    const openProfile = (contact) => {
        setSelectedContact(contact);
        setShowDetails(true);
    };

    return (
        <>
            <div className="contact-body">
                <SimpleBar className="nicescroll-bar">
                    <div className={classNames('contact-card-view', { 'select-multiple': multipleSelection })}>
                        <Row className="mb-3 align-items-center">
                            <Col xs={12} xl={6} className="mb-2 mb-xl-0">
                                <div className="contact-toolbar-left d-flex flex-wrap gap-2 align-items-center">
                                    <Form.Select size="sm" className="w-auto" value={activeFilter} disabled>
                                        <option value="all">All Contacts</option>
                                        <option value="important">Important</option>
                                        <option value="archived">Archived</option>
                                        <option value="pending">Pending</option>
                                        <option value="deleted">Deleted</option>
                                    </Form.Select>
                                    <Button size="sm" variant="outline-secondary">Bulk actions</Button>
                                </div>
                            </Col>
                            <Col xs={12} xl={6}>
                                <div className="contact-toolbar-right d-flex justify-content-xl-end">
                                    <div id="datable_1_filter" className="dataTables_filter w-100 w-xl-auto">
                                        <label className="w-100 mb-0">
                                            <Form.Control size="sm" type="search" placeholder="Search contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                        </label>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row className="row-cols-xxl-4 row-cols-xl-3 row-cols-lg-3 row-cols-md-2 row-cols-1 mb-5 gx-3">
                            {filteredContacts.map(contact => {
                                const labels = getContactLabels(contact);
                                const status = getContactStatus(contact);

                                return (
                                    <Col key={contact.id}>
                                        <Card className="card-border contact-card h-100">
                                            <Card.Body className="text-center">
                                                <Form.Check type="checkbox" className="form-check-lg">
                                                    <Form.Check.Input type="checkbox" className="check-select" checked={selectedIds.includes(contact.id)} onChange={() => toggleCheck(contact.id)} />
                                                    <Form.Check.Label htmlFor={`chk_sel_${contact.id}`} />
                                                </Form.Check>
                                                <div className="card-action-wrap">
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret">
                                                            <span className="btn-icon-wrap">
                                                                <span className="feather-icon"><MoreVertical /></span>
                                                            </span>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu align="end">
                                                            <Dropdown.Item as={Link} to={`/apps/contacts/detail/${contact.id}`}>Open profile</Dropdown.Item>
                                                            <Dropdown.Item as={Link} to="#">Forward</Dropdown.Item>
                                                            <Dropdown.Item as={Link} to="#">Delete</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                                <div className="avatar avatar-xl avatar-rounded bg-soft-primary text-primary fw-bold d-flex align-items-center justify-content-center mx-auto">
                                                    {getContactInitials(contact)}
                                                </div>
                                                <div className="user-name mt-3">
                                                    <span className={classNames('contact-star', { marked: !!contact.favorite || !!contact.starred || !!contact.stared })}>
                                                        <span className="feather-icon"><Star /></span>
                                                    </span>
                                                    {getContactName(contact)}
                                                </div>
                                                <div className="user-email">{contact.email || '-'}</div>
                                                <div className="user-contact">{contact.phone || '-'}</div>
                                                <div className="user-desg">
                                                    <Badge bg={status === 'important' ? 'warning' : status === 'archived' ? 'secondary' : status === 'pending' ? 'info' : status === 'deleted' ? 'danger' : 'primary'} className="badge-indicator me-2" />
                                                    {formatContactSubtitle(contact) || contact.department || 'Unassigned'}
                                                </div>
                                                {labels.length ? (
                                                    <div className="mt-2 d-flex flex-wrap justify-content-center gap-1">
                                                        {labels.slice(0, 3).map(label => (
                                                            <Badge key={`${contact.id}-${label}`} bg="light" text="dark" className="border fs-8">{label}</Badge>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </Card.Body>
                                            <Card.Footer className="text-muted position-relative">
                                                <a href={`mailto:${contact.email || ''}`} className="d-flex align-items-center">
                                                    <span className="feather-icon me-2"><Inbox /></span>
                                                    <span className="fs-7 lh-1">Message</span>
                                                </a>
                                                <div className="v-separator-full m-0" />
                                                <button type="button" className="btn btn-link text-decoration-none d-flex align-items-center p-0" onClick={() => openProfile(contact)}>
                                                    <span className="feather-icon me-2"><UserCheck /></span>
                                                    <span className="fs-7 lh-1">Profile</span>
                                                </button>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>

                        {filteredContacts.length === 0 ? (
                            <div className="text-center py-5 text-muted">No contacts match the current filter.</div>
                        ) : null}
                    </div>
                </SimpleBar>
            </div>

            <ContactDetails show={showDetails} onHide={() => setShowDetails(false)} contact={selectedContact} />
        </>
    );
};

const mapStateToProps = ({ contacts }) => ({ contacts });
export default connect(mapStateToProps)(ContactCardsBody);
