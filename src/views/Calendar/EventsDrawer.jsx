import React from 'react';
import { Badge, Button, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const EventsDrawer = ({ show, onClose, eventData }) => {
  const task = eventData?.extendedProps?.task;
  const opportunity = eventData?.extendedProps?.opportunity;
  const activity = eventData?.extendedProps?.activity;
  const payload = task || opportunity || activity;

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{eventData?.title || 'Event details'}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!payload ? (
          <div className="text-muted">No event selected.</div>
        ) : (
          <>
            {task && <Badge bg="primary" className="mb-3">Task</Badge>}
            {opportunity && <Badge bg="info" className="mb-3">Opportunity</Badge>}
            {activity && <Badge bg="secondary" className="mb-3">Activity</Badge>}
            <div className="mb-2"><strong>Starts:</strong> {eventData?.start ? new Date(eventData.start).toLocaleString() : '-'}</div>
            <div className="mb-2"><strong>Ends:</strong> {eventData?.end ? new Date(eventData.end).toLocaleString() : '-'}</div>
            {'assignedTo' in payload && <div className="mb-2"><strong>Assigned To:</strong> {payload.assignedTo || '-'}</div>}
            {'contactName' in payload && <div className="mb-2"><strong>Contact:</strong> {payload.contactName || '-'}</div>}
            {'company' in payload && <div className="mb-2"><strong>Company:</strong> {payload.company || '-'}</div>}
            {'dealValue' in payload && <div className="mb-2"><strong>Value:</strong> {payload.dealCurrency === 'GHS' ? '₵' : '$'}{Number(payload.dealValue || 0).toLocaleString()}</div>}
            {'priority' in payload && <div className="mb-2"><strong>Priority:</strong> {payload.priority || '-'}</div>}
            {'status' in payload && <div className="mb-2"><strong>Status:</strong> {payload.status || '-'}</div>}
            <div className="mb-2"><strong>Description:</strong></div>
            <p className="text-muted">{payload.description || 'No description available.'}</p>
            <Button variant="primary" as={Link} to={opportunity ? '/apps/opportunities' : '/apps/tasks/task-list'}>{opportunity ? 'Open Opportunities' : 'Open Tasks'}</Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default EventsDrawer;
