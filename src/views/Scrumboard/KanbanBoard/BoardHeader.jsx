import React from 'react';
import { ChevronDown, ChevronUp, Info, Plus, Star } from 'react-feather';
import { connect } from 'react-redux';
import { toggleTopNav } from '../../../redux/action/Theme';
import classNames from 'classnames';
import { Button, Form, InputGroup, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import { Link } from 'react-router-dom';

// Derive a consistent avatar bg color from a name string
const avatarColor = (name) => {
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'pink', 'violet', 'orange'];
    if (!name) return 'primary';
    return colors[name.charCodeAt(0) % colors.length];
};

const MemberAvatar = ({ name, selected, onClick }) => {
    const color = avatarColor(name);
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{name}</Tooltip>}>
            <div
                onClick={onClick}
                className={`avatar avatar-rounded`}
                style={{
                    cursor: 'pointer',
                    opacity: selected ? 1 : 0.4,
                    outline: selected ? `2px solid var(--bs-${color})` : '2px solid transparent',
                    outlineOffset: 2,
                    transition: 'opacity 0.15s ease, outline 0.15s ease',
                    userSelect: 'none',
                }}
                title={name}
            >
                <div className={`avatar avatar-sm avatar-soft-${color} avatar-rounded`} style={{ margin: 0 }}>
                    <span className="initial-wrap" style={{ fontSize: '11px' }}>
                        {name.charAt(0).toUpperCase()}
                    </span>
                </div>
            </div>
        </OverlayTrigger>
    );
};

const BoardHeader = ({
    topNavCollapsed,
    toggleTopNav,
    showSidebar,
    toggleSidebar,
    showInfo,
    toggleInfo,
    tasks = [],
    selectedMembers = [],
    onToggleMember,
    onClearFilter,
}) => {
    // Derive unique assignees from tasks
    const assignees = [...new Set(
        tasks.map(t => t.assignedTo).filter(a => a && a !== 'Unassigned')
    )].sort();

    const allSelected = selectedMembers.length === 0;

    return (
        <header className="taskboard-header">
            {/* Left: Title */}
            <div className="d-flex align-items-center flex-1">
                <div className="d-flex align-items-center gap-2">
                    <Link to="#" className="taskboardapp-title link-dark">
                        <h1 className="mb-0">
                            Geovision
                            <span className="task-star marked ms-2">
                                <span className="feather-icon"><Star size={14} /></span>
                            </span>
                        </h1>
                    </Link>
                    <div>
                        <InputGroup>
                            <span className="input-affix-wrapper">
                                <span className="input-prefix">
                                    <i className="ri-lock-line" />
                                </span>
                                <Form.Select size="sm">
                                    <option value={1}>Private Board</option>
                                    <option value={2}>Public Board</option>
                                </Form.Select>
                            </span>
                        </InputGroup>
                    </div>
                </div>
            </div>

            {/* Center: View tabs */}
            <Nav variant="pills" className="nav-pills-rounded active-theme nav-light px-2 flex-shrink-0 d-xxl-flex d-none">
                <Nav.Item>
                    <Nav.Link active><span className="nav-link-text">Kanban Board</span></Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/apps/tasks/gantt"><span className="nav-link-text">Gantt</span></Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/apps/tasks/task-list"><span className="nav-link-text">Task List</span></Nav.Link>
                </Nav.Item>
            </Nav>

            {/* Right: Member filters + actions */}
            <div className="taskboard-options-wrap flex-1">
                <div className="d-flex align-items-center ms-auto gap-2">
                    {/* Member filter avatars */}
                    {assignees.length > 0 && (
                        <div className="d-xl-flex d-none align-items-center gap-1">
                            {/* "All" pill */}
                            <OverlayTrigger placement="top" overlay={<Tooltip>Show all</Tooltip>}>
                                <div
                                    onClick={onClearFilter}
                                    className="avatar avatar-rounded"
                                    style={{
                                        cursor: 'pointer',
                                        opacity: allSelected ? 1 : 0.4,
                                        outline: allSelected ? '2px solid #adb5bd' : '2px solid transparent',
                                        outlineOffset: 2,
                                        transition: 'opacity 0.15s ease',
                                    }}
                                >
                                    <div className="avatar avatar-sm avatar-soft-secondary avatar-rounded" style={{ margin: 0 }}>
                                        <span className="initial-wrap" style={{ fontSize: '9px' }}>All</span>
                                    </div>
                                </div>
                            </OverlayTrigger>

                            {/* Individual member avatars */}
                            {assignees.map(name => (
                                <MemberAvatar
                                    key={name}
                                    name={name}
                                    selected={selectedMembers.includes(name)}
                                    onClick={() => onToggleMember(name)}
                                />
                            ))}

                            {/* Filter count badge */}
                            {selectedMembers.length > 0 && (
                                <span
                                    className="badge bg-primary rounded-pill ms-1"
                                    style={{ fontSize: '10px', cursor: 'pointer' }}
                                    onClick={onClearFilter}
                                    title="Clear filter"
                                >
                                    {selectedMembers.length} filtered ×
                                </span>
                            )}

                            <div className="v-separator d-xl-flex d-none mx-1" />
                        </div>
                    )}

                    {/* Info toggle */}
                    <Button
                        as="a"
                        variant="flush-dark"
                        className={classNames('btn-icon btn-rounded flush-soft-hover taskboardapp-info-toggle', { active: showInfo })}
                        onClick={toggleInfo}
                    >
                        <HkTooltip placement="top" title="Info">
                            <span className="icon"><span className="feather-icon"><Info /></span></span>
                        </HkTooltip>
                    </Button>

                    {/* Collapse nav */}
                    <Button
                        as="a"
                        variant="flush-dark"
                        className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable d-sm-inline-block d-none"
                        onClick={() => toggleTopNav(!topNavCollapsed)}
                    >
                        <HkTooltip placement={topNavCollapsed ? 'bottom' : 'top'} title="Collapse">
                            <span className="icon">
                                <span className="feather-icon">
                                    {topNavCollapsed ? <ChevronDown /> : <ChevronUp />}
                                </span>
                            </span>
                        </HkTooltip>
                    </Button>
                </div>
            </div>

            <div className={classNames('hk-sidebar-togglable', { active: !showSidebar })} onClick={toggleSidebar} />
        </header>
    );
};

const mapStateToProps = ({ theme, tasks }) => ({
    topNavCollapsed: theme.topNavCollapsed,
    tasks,
});

export default connect(mapStateToProps, { toggleTopNav })(BoardHeader);
