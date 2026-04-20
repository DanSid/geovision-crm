import React, { useMemo } from 'react';
import { Button, Nav } from 'react-bootstrap';
import { Archive, Book, Download, Inbox, Plus, Printer, Settings, Star, Trash2, Upload } from 'react-feather';
import SimpleBar from 'simplebar-react';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import HkTooltip from '../../components/@hk-tooltip/HkTooltip';
import AddLabel from './AddLabel';
import AddTag from './AddTag';
import CreateNewContact from './CreateNewContact';
import { CONTACT_STATUS_LABELS, countContactsByStatus } from '../../utils/contactWorkspace';

const STATUS_OPTIONS = ['all', 'important', 'archived', 'pending', 'deleted'];

const ContactAppSidebar = ({
    contacts = [],
    activeFilter = 'all',
    onFilterChange = () => {},
    onImportContacts = () => {},
    onExportContacts = () => {},
    onPrintContacts = () => {},
    activeLabel = 'all',
    onLabelChange = () => {},
    labels = [],
}) => {
    const [addLabels, setAddLabels] = React.useState(false);
    const [addTags, setAddTags] = React.useState(false);
    const [addNewContact, setAddNewContact] = React.useState(false);

    const statusCounts = useMemo(() => countContactsByStatus(contacts), [contacts]);

    return (
        <>
            <Nav className="contactapp-sidebar">
                <SimpleBar className="nicescroll-bar">
                    <div className="menu-content-wrap">
                        <Button
                            variant="primary"
                            className="btn-rounded btn-block mb-4"
                            onClick={() => setAddNewContact(true)}
                        >
                            Add new contact
                        </Button>

                        <div className="menu-group">
                            <Nav className="nav-light navbar-nav flex-column">
                                {STATUS_OPTIONS.map(status => (
                                    <Nav.Item key={status}>
                                        <Nav.Link
                                            as="button"
                                            type="button"
                                            active={activeFilter === status}
                                            className="w-100 text-start"
                                            onClick={() => onFilterChange(status)}
                                        >
                                            <span className="nav-icon-wrap">
                                                <span className="feather-icon">
                                                    {status === 'all' && <Inbox />}
                                                    {status === 'important' && <Star />}
                                                    {status === 'archived' && <Archive />}
                                                    {status === 'pending' && <Book />}
                                                    {status === 'deleted' && <Trash2 />}
                                                </span>
                                            </span>
                                            <span className="nav-link-text">{CONTACT_STATUS_LABELS[status]}</span>
                                            <span className="badge badge-pill badge-sm badge-soft-primary ms-auto">{statusCounts[status]}</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </div>

                        <div className="separator separator-light" />

                        <div className="menu-group">
                            <Nav className="nav-light navbar-nav flex-column">
                                <Nav.Item>
                                    <Nav.Link as="button" type="button" className="w-100 text-start" onClick={onExportContacts}>
                                        <span className="nav-icon-wrap"><span className="feather-icon"><Upload /></span></span>
                                        <span className="nav-link-text">Export contacts</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as="button" type="button" className="w-100 text-start" onClick={onImportContacts}>
                                        <span className="nav-icon-wrap"><span className="feather-icon"><Download /></span></span>
                                        <span className="nav-link-text">Import contacts</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as="button" type="button" className="w-100 text-start" onClick={onPrintContacts}>
                                        <span className="nav-icon-wrap"><span className="feather-icon"><Printer /></span></span>
                                        <span className="nav-link-text">Print contacts</span>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>

                        <div className="separator separator-light" />

                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="title-sm text-primary mb-0">Labels</div>
                            <Button variant="light" size="xs" className="btn-icon btn-rounded" onClick={() => setAddLabels(true)}>
                                <HkTooltip placement="top" title="Add Label">
                                    <span className="feather-icon"><Plus /></span>
                                </HkTooltip>
                            </Button>
                        </div>
                        <div className="menu-group">
                            <Nav className="nav-light navbar-nav flex-column">
                                {labels.length ? labels.map(label => (
                                    <Nav.Item key={label.label}>
                                        <Nav.Link
                                            as="button"
                                            type="button"
                                            active={activeLabel === label.label}
                                            className="link-badge-right w-100 text-start"
                                            onClick={() => onLabelChange(activeLabel === label.label ? 'all' : label.label)}
                                        >
                                            <span className="nav-link-text">{label.label}</span>
                                            <span className="badge badge-pill badge-sm badge-soft-primary ms-auto">{label.count}</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                )) : (
                                    <Nav.Item>
                                        <Nav.Link as="button" type="button" className="w-100 text-start disabled">
                                            <span className="nav-link-text">No labels yet</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                            </Nav>
                        </div>

                        <div className="separator separator-light" />

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="title-sm text-primary mb-0">Tags</div>
                            <Button variant="light" size="xs" className="btn-icon btn-rounded" onClick={() => setAddTags(true)}>
                                <HkTooltip placement="top" title="Add Tag">
                                    <span className="feather-icon"><Plus /></span>
                                </HkTooltip>
                            </Button>
                        </div>
                        <div className="tag-cloud">
                            <HkBadge bg="white" className="badge-light" outline text="dark">Collaboration</HkBadge>
                            <HkBadge bg="white" className="badge-light" outline text="dark">React Developer</HkBadge>
                            <HkBadge bg="white" className="badge-light" outline text="dark">Angular Developer</HkBadge>
                            <HkBadge bg="white" className="badge-light" outline text="dark">Promotion</HkBadge>
                            <HkBadge bg="white" className="badge-light" outline text="dark">Advertisement</HkBadge>
                        </div>
                    </div>
                </SimpleBar>
                <div className="contactapp-fixednav">
                    <div className="hk-toolbar">
                        <Nav className="nav-light">
                            <Nav.Item className="nav-link">
                                <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => setAddNewContact(true)}>
                                    <HkTooltip id="tooltip2" placement="top" title="Add Contact">
                                        <span className="icon"><span className="feather-icon"><Plus /></span></span>
                                    </HkTooltip>
                                </Button>
                            </Nav.Item>
                            <Nav.Item className="nav-link">
                                <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                    <HkTooltip id="tooltip3" placement="top" title="Archive">
                                        <span className="icon"><span className="feather-icon"><Archive /></span></span>
                                    </HkTooltip>
                                </Button>
                            </Nav.Item>
                            <Nav.Item className="nav-link">
                                <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                    <HkTooltip id="tooltip2" placement="top" title="Settings">
                                        <span className="icon"><span className="feather-icon"><Settings /></span></span>
                                    </HkTooltip>
                                </Button>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
            </Nav>

            <CreateNewContact show={addNewContact} close={() => setAddNewContact(false)} />
            <AddLabel show={addLabels} hide={() => setAddLabels(false)} />
            <AddTag show={addTags} hide={() => setAddTags(false)} />
        </>
    );
};

export default ContactAppSidebar;
