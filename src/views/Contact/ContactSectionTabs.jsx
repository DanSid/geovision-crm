import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';

const ContactSectionTabs = () => {
    const contactsMatch = useRouteMatch('/apps/contacts/contact-list') ||
        useRouteMatch('/apps/contacts/contact-cards') ||
        useRouteMatch('/apps/contacts/companies') ||
        useRouteMatch('/apps/contacts/groups') ||
        useRouteMatch('/apps/contacts/detail') ||
        useRouteMatch('/apps/contacts/edit-contact');
    const companiesMatch = useRouteMatch('/apps/contacts/companies');
    const groupsMatch = useRouteMatch('/apps/contacts/groups');

    return (
        <div className="contact-section-tabs border-bottom mb-0">
            <Nav variant="tabs" className="nav-light" style={{ borderBottom: 'none' }}>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/apps/contacts/contact-list"
                        active={!!contactsMatch}
                        className="fw-medium"
                    >
                        Contacts
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/apps/contacts/companies"
                        active={!!companiesMatch}
                        className="fw-medium"
                    >
                        Companies
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/apps/contacts/groups"
                        active={!!groupsMatch}
                        className="fw-medium"
                    >
                        Groups
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default ContactSectionTabs;
