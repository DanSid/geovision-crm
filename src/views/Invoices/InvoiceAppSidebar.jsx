import React from 'react';
import { Button, Dropdown, Nav } from 'react-bootstrap';
import { Archive, Book, Download, Edit, Layers, Save, Settings, Star, Trash2, Upload, User, Users } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import HkTooltip from '../../components/@hk-tooltip/HkTooltip';

const InvoiceAppSidebar = () => {
    const location = useLocation();
    const at = (path) => location.pathname.includes(path);

    return (
        <nav className="invoiceapp-sidebar">
            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">
                    {/* Create Dropdown */}
                    <Dropdown>
                        <Dropdown.Toggle variant="primary" className="btn-rounded btn-block mb-4">
                            Create
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/apps/accounts/create-invoice">
                                Create Invoice
                            </Dropdown.Item>
                            <Dropdown.Item as={Link} to="/apps/accounts/invoice-templates">
                                From Template
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Main nav */}
                    <div className="menu-group">
                        <Nav as="ul" className="nav-light navbar-nav flex-column">
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list" active={at('invoice-list')}>
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><User /></span>
                                    </span>
                                    <span className="nav-link-text">All Invoices</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list" onClick={() => {}}>
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Star /></span>
                                    </span>
                                    <span className="nav-link-text">Sent</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Archive /></span>
                                    </span>
                                    <span className="nav-link-text">Archived</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Edit /></span>
                                    </span>
                                    <span className="nav-link-text">Pending</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Trash2 /></span>
                                    </span>
                                    <span className="nav-link-text">Deleted</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    <div className="menu-gap" />

                    <div className="nav-header"><span>Manage</span></div>
                    <div className="menu-group">
                        <Nav as="ul" className="nav-light navbar-nav flex-column">
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Upload /></span>
                                    </span>
                                    <span className="nav-link-text">Manage Invoices</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Download /></span>
                                    </span>
                                    <span className="nav-link-text">Recurring Invoices</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Layers /></span>
                                    </span>
                                    <span className="nav-link-text">Manage Estimate</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Book /></span>
                                    </span>
                                    <span className="nav-link-text">Manage Contacts</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-templates" active={at('invoice-templates')}>
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Save /></span>
                                    </span>
                                    <span className="nav-link-text">Saved Templates</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    <div className="menu-gap" />

                    <div className="nav-header"><span>Info</span></div>
                    <div className="menu-group">
                        <Nav as="ul" className="nav nav-light navbar-nav flex-column">
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Users /></span>
                                    </span>
                                    <span className="nav-link-text">Business Info</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li">
                                <Nav.Link as={Link} to="/apps/accounts/invoice-list">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon"><Star /></span>
                                    </span>
                                    <span className="nav-link-text">Tax Info</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
            </SimpleBar>

            {/* Sidebar Fixnav */}
            <div className="invoiceapp-fixednav">
                <div className="hk-toolbar">
                    <Nav as="ul" className="nav-light">
                        <Nav.Item className="nav-link">
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                <HkTooltip id="tooltip-settings" placement="top" title="Settings">
                                    <span className="icon">
                                        <span className="feather-icon"><Settings /></span>
                                    </span>
                                </HkTooltip>
                            </Button>
                        </Nav.Item>
                        <Nav.Item className="nav-link">
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                <HkTooltip id="tooltip-archive" placement="top" title="Archive">
                                    <span className="icon">
                                        <span className="feather-icon"><Archive /></span>
                                    </span>
                                </HkTooltip>
                            </Button>
                        </Nav.Item>
                        <Nav.Item className="nav-link">
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                <HkTooltip id="tooltip-help" placement="top" title="Help">
                                    <span className="icon">
                                        <span className="feather-icon"><Book /></span>
                                    </span>
                                </HkTooltip>
                            </Button>
                        </Nav.Item>
                    </Nav>
                </div>
            </div>
        </nav>
    );
};

export default InvoiceAppSidebar;
