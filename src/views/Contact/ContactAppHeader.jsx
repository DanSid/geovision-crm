import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import classNames from 'classnames';
import { Archive, ChevronDown, ChevronUp, Download, ExternalLink, Grid, List, MoreVertical, Printer, RefreshCw, Server, Settings, Slash, Star, Upload, User } from 'react-feather';
import { connect } from 'react-redux';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { toggleTopNav } from '../../redux/action/Theme';
import HkTooltip from '../../components/@hk-tooltip/HkTooltip';
import ContactSectionTabs from './ContactSectionTabs';

const ActionItem = ({ children, onClick }) => (
    <Dropdown.Item as="button" type="button" onClick={onClick}>
        {children}
    </Dropdown.Item>
);

const ContactAppHeader = ({
    topNavCollapsed,
    toggleTopNav,
    toggleSidebar,
    show,
    onCreateContact = () => {},
    onImportContacts = () => {},
    onExportContacts = () => {},
    onPrintContacts = () => {},
}) => {
    const contactListRoute = useRouteMatch('/apps/contacts/contact-list');

    return (
        <header className="contact-header contact-header-stacked">
            <ContactSectionTabs />
            <div className="contact-header-main">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <Dropdown className="contactapp-title-dropdown">
                        <Dropdown.Toggle as="button" type="button" className="contactapp-title btn btn-link link-dark p-0 text-decoration-none border-0 shadow-none">
                            <h1>Contacts</h1>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <ActionItem onClick={onCreateContact}>
                                <span className="feather-icon dropdown-icon"><User /></span>
                                <span>Add New Contact</span>
                            </ActionItem>
                            <ActionItem onClick={onExportContacts}>
                                <span className="feather-icon dropdown-icon"><Upload /></span>
                                <span>Export Contacts</span>
                            </ActionItem>
                            <ActionItem onClick={onImportContacts}>
                                <span className="feather-icon dropdown-icon"><Download /></span>
                                <span>Import Contacts</span>
                            </ActionItem>
                            <ActionItem onClick={onPrintContacts}>
                                <span className="feather-icon dropdown-icon"><Printer /></span>
                                <span>Print Contacts</span>
                            </ActionItem>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown>
                        <Dropdown.Toggle size="sm" variant="outline-secondary" className="flex-shrink-0 d-lg-inline-flex d-none align-items-center" type="button">
                            Create New
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item as="button" type="button" onClick={onCreateContact}>Add New Contact</Dropdown.Item>
                            <Dropdown.Item as="button" type="button">Add New Department</Dropdown.Item>
                            <Dropdown.Item as="button" type="button">Add Category</Dropdown.Item>
                            <Dropdown.Item as="button" type="button">Add New Tag</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="contact-header-actions">
                    <Dropdown className="inline-block">
                        <Dropdown.Toggle as="button" type="button" className="btn btn-icon btn-flush-dark flush-soft-hover no-caret active">
                            <span className="icon">
                                <span className="feather-icon">{contactListRoute ? <List /> : <Grid />}</span>
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item as={NavLink} to="/apps/contacts/contact-list" activeClassName="active">
                                <span className="feather-icon dropdown-icon"><List /></span>
                                <span>List View</span>
                            </Dropdown.Item>
                            <Dropdown.Item as={NavLink} to="/apps/contacts/contact-cards" activeClassName="active">
                                <span className="feather-icon dropdown-icon"><Grid /></span>
                                <span>Grid View</span>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <span className="feather-icon dropdown-icon"><Server /></span>
                                <span>Compact View</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button as="button" type="button" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret d-sm-inline-block d-none">
                        <HkTooltip title="Refresh" placement="top">
                            <span className="icon"><span className="feather-icon"><RefreshCw /></span></span>
                        </HkTooltip>
                    </Button>
                    <div className="v-separator d-lg-block d-none" />
                    <Dropdown className="inline-block">
                        <Dropdown.Toggle as="button" type="button" className="btn btn-flush-dark btn-icon btn-rounded flush-soft-hover no-caret d-lg-inline-block d-none ms-sm-0">
                            <HkTooltip placement="top" title="Manage Contact">
                                <span className="icon"><span className="feather-icon"><Settings /></span></span>
                            </HkTooltip>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <ActionItem onClick={onImportContacts}>Manage Contact</ActionItem>
                            <ActionItem onClick={onImportContacts}>Import</ActionItem>
                            <ActionItem onClick={onExportContacts}>Export</ActionItem>
                            <div className="dropdown-divider" />
                            <ActionItem>Send Messages</ActionItem>
                            <ActionItem>Delegate Access</ActionItem>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown className="inline-block ms-1">
                        <Dropdown.Toggle as="button" type="button" className="btn btn-flush-dark btn-icon btn-rounded btn-flush-dark flush-soft-hover no-caret d-lg-inline-block d-none">
                            <HkTooltip placement="top" title="More">
                                <span className="icon"><span className="feather-icon"><MoreVertical /></span></span>
                            </HkTooltip>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <ActionItem>
                                <span className="feather-icon dropdown-icon"><Star /></span>
                                <span>Starred Contacts</span>
                            </ActionItem>
                            <ActionItem>
                                <span className="feather-icon dropdown-icon"><Archive /></span>
                                <span>Archive Contacts</span>
                            </ActionItem>
                            <div className="dropdown-divider" />
                            <ActionItem>
                                <span className="feather-icon dropdown-icon"><Slash /></span>
                                <span>Block Content</span>
                            </ActionItem>
                            <ActionItem>
                                <span className="feather-icon dropdown-icon"><ExternalLink /></span>
                                <span>Feedback</span>
                            </ActionItem>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button as="button" type="button" className="btn-icon btn-flush-dark btn-rounded flush-soft-hover hk-navbar-togglable d-sm-inline-block d-none" onClick={() => toggleTopNav(!topNavCollapsed)}>
                        <HkTooltip placement={topNavCollapsed ? 'bottom' : 'top'} title="Collapse">
                            <span className="icon">
                                <span className="feather-icon">{topNavCollapsed ? <ChevronDown /> : <ChevronUp />}</span>
                            </span>
                        </HkTooltip>
                    </Button>
                </div>
            </div>
            <div className={classNames('hk-sidebar-togglable', { active: show })} onClick={toggleSidebar} />
        </header>
    );
};

const mapStateToProps = ({ theme }) => {
    const { topNavCollapsed } = theme;
    return { topNavCollapsed };
};

export default connect(mapStateToProps, { toggleTopNav })(ContactAppHeader);
