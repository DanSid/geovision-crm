import React from 'react';
import { Nav } from 'react-bootstrap';

const Header = () => {
    return (
        <header className="profile-header">
            <Nav defaultActiveKey="tab1" as="ul" variant="tabs" className="nav-line nav-icon nav-light h-100">
                <Nav.Item as="li">
                    <Nav.Link eventKey="tab1" className="d-flex align-items-center h-100">
                        <span className="nav-link-text">Profile</span>
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </header>
    );
};

export default Header;
