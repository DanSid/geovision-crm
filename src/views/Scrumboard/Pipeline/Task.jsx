import React from 'react';
import classNames from 'classnames';
import { Draggable } from '@hello-pangea/dnd';
import { Badge, Card, Dropdown } from 'react-bootstrap';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'react-feather';

const STAGE_COLORS = {
    'Prospecting':   'info',
    'Qualification': 'primary',
    'Proposal':      'warning',
    'Negotiation':   'secondary',
    'Closed Won':    'success',
    'Closed Lost':   'danger',
};

const Task = ({ task, index }) => {
    const isOppTask = task.id?.startsWith('opp-');

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <Card
                    className={classNames(
                        'card-border spipeline-card',
                        { 'lost-deal': task.status === 'lost' },
                        { 'won-deal': task.status === 'won' },
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Card.Body>
                        {/* Growth indicator */}
                        <div className="card-action-wrap">
                            <span
                                className={classNames(
                                    'badge rounded-pill',
                                    { 'bg-primary': task.growth === 'high' },
                                    { 'bg-warning': task.growth === 'average' },
                                    { 'bg-danger':  task.growth === 'low'  },
                                    { 'bg-secondary': task.growth === 'normal' || !task.growth },
                                )}
                                style={{ fontSize: 10, padding: '3px 7px' }}
                            >
                                {task.growth === 'high'    && <ChevronRight size={12} />}
                                {task.growth === 'low'     && <ChevronLeft  size={12} />}
                                {task.growth === 'average' && <AlertTriangle size={12} />}
                                {(!task.growth || task.growth === 'normal') && <ChevronRight size={12} />}
                            </span>
                        </div>

                        <div className="media">
                            <div className="media-head me-2">
                                {/* Logo: initials-based for CRM items */}
                                {task.initLogo && (
                                    <div className={classNames('avatar avatar-rounded avatar-sm', task.logoBg || 'avatar-primary')}>
                                        <span className="initial-wrap">{task.initLogo}</span>
                                    </div>
                                )}
                                {task.symbolLogo && !task.initLogo && (
                                    <div className="avatar avatar-logo avatar-rounded">
                                        <span className="initial-wrap">
                                            <img src={task.symbolLogo} alt="logo" />
                                        </span>
                                    </div>
                                )}
                                {task.logo && !task.initLogo && !task.symbolLogo && (
                                    <div className="avatar avatar-rounded">
                                        <img src={task.logo} alt="brand" className="avatar-img" />
                                    </div>
                                )}
                            </div>
                            <div className="media-body">
                                <div className="brand-name fw-medium">{task.brandName}</div>
                                {task.price && (
                                    <div className="price-estimation text-success fw-medium">{task.price}</div>
                                )}
                                {task.type && (
                                    <div className="brand-cat text-muted" style={{ fontSize: 11 }}>{task.type}</div>
                                )}

                                {/* Stage badge for CRM items */}
                                {isOppTask && task.stage && (
                                    <Badge
                                        bg={STAGE_COLORS[task.stage] || 'secondary'}
                                        className="fw-normal mt-1"
                                        style={{ fontSize: 10 }}
                                    >
                                        {task.stage}
                                    </Badge>
                                )}

                                {/* Contact / close date */}
                                <div className="mt-1 d-flex align-items-center gap-2">
                                    {task.contactName && (
                                        <div className="d-flex align-items-center gap-1">
                                            <div
                                                className="avatar avatar-xs avatar-primary avatar-rounded d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 20, height: 20, minWidth: 20, fontSize: 10 }}
                                            >
                                                {task.contactName.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 11 }}>{task.contactName}</span>
                                        </div>
                                    )}
                                    {task.avatar && !task.contactName && (
                                        <div className="avatar avatar-xs avatar-rounded">
                                            <img src={task.avatar} alt="user" className="avatar-img" />
                                        </div>
                                    )}
                                    {task.lastUsed && (
                                        <p
                                            className={classNames('mb-0', { 'text-danger': task.status === 'lost' })}
                                            style={{ fontSize: 11 }}
                                        >
                                            {task.lastUsed}
                                        </p>
                                    )}
                                </div>

                                {/* Notes for CRM items */}
                                {task.notes && (
                                    <div className="text-muted mt-1" style={{ fontSize: 10 }}>
                                        {task.notes.length > 60 ? task.notes.substring(0, 60) + '…' : task.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Draggable>
    );
};

export default Task;
