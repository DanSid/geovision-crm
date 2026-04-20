import React from 'react';
import { Badge, Button, Card, Col, Modal, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Star, User } from 'react-feather';
import { Rating } from 'react-simple-star-rating';
import SimpleBar from 'simplebar-react';
import { formatContactSubtitle, getContactInitials, getContactLabels, getContactName, getContactStatus } from '../../../utils/contactWorkspace';

const variantByStatus = (status) => ({
    important: 'warning',
    archived: 'secondary',
    pending: 'info',
    deleted: 'danger',
    all: 'success',
}[status] || 'success');

const ContactDetails = ({ show, onHide, contact }) => {
    if (!contact) return null;

    const labels = getContactLabels(contact);
    const status = getContactStatus(contact);

    return (
        <Modal show={show} onHide={onHide} centered size="xl" dialogClassName="contact-detail-modal">
            <Modal.Body className="p-0">
                <header className="contact-header">
                    <div className="d-flex align-items-center">
                        <span className="me-3">
                            <div className="avatar avatar-xl avatar-rounded bg-soft-primary text-primary fw-bold d-flex align-items-center justify-content-center">
                                {getContactInitials(contact)}
                            </div>
                        </span>
                        <div>
                            <div className="cp-name text-truncate">{getContactName(contact)}</div>
                            <p className="mb-1">{formatContactSubtitle(contact) || contact.email || 'No additional subtitle'}</p>
                            <Rating initialValue={4} readonly size="20" />
                        </div>
                    </div>
                    <div className="contact-options-wrap">
                        <ul className="hk-list hk-list-sm justify-content-center d-xl-flex d-none">
                            <li>
                                <a className="btn btn-icon btn-soft-primary btn-rounded" href={`mailto:${contact.email || ''}`}>
                                    <span className="btn-icon-wrap"><span className="feather-icon"><Mail /></span></span>
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-icon btn-soft-success btn-rounded" href={`tel:${contact.phone || ''}`}>
                                    <span className="btn-icon-wrap"><span className="feather-icon"><Phone /></span></span>
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-icon btn-soft-danger btn-rounded" href="#some">
                                    <span className="btn-icon-wrap"><span className="feather-icon"><User /></span></span>
                                </a>
                            </li>
                        </ul>
                        <div className="align-items-center d-xl-flex d-none me-3">
                            <Badge bg={variantByStatus(status)} className="fw-normal text-capitalize">{status}</Badge>
                        </div>
                        <Button as={Link} to={`/apps/contacts/detail/${contact.id}`} variant="light" size="sm" className="ms-3 d-xl-inline-block d-none">
                            Open Full Profile
                        </Button>
                    </div>
                </header>
                <div className="contact-body contact-detail-body">
                    <SimpleBar className="nicescroll-bar">
                        <Row className="g-3 p-3">
                            <Col xl={4} md={6}>
                                <Card className="h-100 shadow-none border">
                                    <Card.Header className="py-2 px-3 bg-white border-bottom">
                                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Profile Information</h6>
                                    </Card.Header>
                                    <Card.Body className="py-2 px-3">
                                        <InfoRow label="First name" value={contact.firstName} />
                                        <InfoRow label="Last name" value={contact.lastName} />
                                        <InfoRow label="Email" value={contact.email} />
                                        <InfoRow label="Phone" value={contact.phone} />
                                        <InfoRow label="Department" value={contact.department} />
                                        <InfoRow label="Company" value={contact.company} />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xl={4} md={6}>
                                <Card className="h-100 shadow-none border">
                                    <Card.Header className="py-2 px-3 bg-white border-bottom">
                                        <h6 className="mb-0 text-primary fs-7 fw-semibold">More Info</h6>
                                    </Card.Header>
                                    <Card.Body className="py-2 px-3">
                                        <InfoRow label="Labels" value={labels.join(', ') || 'None'} />
                                        <InfoRow label="Created" value={contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '-'} />
                                        <InfoRow label="Location" value={contact.location || contact.city || contact.country} />
                                        <InfoRow label="Website" value={contact.website} />
                                        <InfoRow label="Notes" value={contact.notes} />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xl={4} md={12}>
                                <Card className="h-100 shadow-none border">
                                    <Card.Header className="py-2 px-3 bg-white border-bottom">
                                        <h6 className="mb-0 text-primary fs-7 fw-semibold">Flags</h6>
                                    </Card.Header>
                                    <Card.Body className="py-2 px-3">
                                        <div className="d-flex justify-content-between mb-2"><span className="text-muted fs-7">Important</span><span className="fs-7">{contact.favorite ? 'Yes' : 'No'}</span></div>
                                        <div className="d-flex justify-content-between mb-2"><span className="text-muted fs-7">Archived</span><span className="fs-7">{contact.archived ? 'Yes' : 'No'}</span></div>
                                        <div className="d-flex justify-content-between mb-2"><span className="text-muted fs-7">Pending</span><span className="fs-7">{contact.pending ? 'Yes' : 'No'}</span></div>
                                        <div className="d-flex justify-content-between mb-2"><span className="text-muted fs-7">Deleted</span><span className="fs-7">{contact.deleted ? 'Yes' : 'No'}</span></div>
                                        <div className="mt-3 d-flex flex-wrap gap-2">
                                            {labels.length ? labels.map(label => (
                                                <Badge key={label} bg="light" text="dark" className="border fs-8">{label}</Badge>
                                            )) : <span className="text-muted fs-7">No labels assigned</span>}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </SimpleBar>
                </div>
            </Modal.Body>
        </Modal>
    );
};

const InfoRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="d-flex gap-2 mb-1">
            <span className="text-muted fs-7" style={{ minWidth: 90 }}>{label}</span>
            <span className="fs-7 fw-medium">{value}</span>
        </div>
    );
};

export default ContactDetails;
