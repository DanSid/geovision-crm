import React from 'react';
import { Badge, Button, Col, Modal, Row } from 'react-bootstrap';
import { priorityColor, statusColor } from '../../../utils/taskData';

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

const TaskInfo = ({ task, close, onEdit }) => {
  return (
    <Modal show={!!task} onHide={close} centered size="lg" scrollable>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="fs-5">Task Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {task && (
          <>
            {/* Title & Badges */}
            <div className="mb-4">
              <h4 className="mb-2">{task.title}</h4>
              <div className="d-flex gap-2 flex-wrap">
                <Badge bg={priorityColor(task.priority)} className="px-3 py-2">{task.priority}</Badge>
                <Badge bg={statusColor(task.status)} className="px-3 py-2">{task.status}</Badge>
                {task.category && <Badge bg="secondary" className="px-3 py-2">{task.category}</Badge>}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="mb-4 p-3 bg-light rounded">
                <div className="text-muted text-uppercase fw-semibold fs-8 mb-2" style={{ letterSpacing: '0.08em' }}>Description</div>
                <p className="mb-0">{task.description}</p>
              </div>
            )}

            {/* Dates */}
            <Row className="g-3 mb-4">
              <Col sm={6}>
                <div className="border rounded p-3 h-100">
                  <div className="text-muted fw-semibold fs-8 mb-1" style={{ letterSpacing: '0.08em' }}>START DATE</div>
                  <div className="fw-medium fs-6">{formatDate(task.startDate || task.start)}</div>
                </div>
              </Col>
              <Col sm={6}>
                <div className="border rounded p-3 h-100">
                  <div className="text-muted fw-semibold fs-8 mb-1" style={{ letterSpacing: '0.08em' }}>DUE DATE</div>
                  <div className="fw-medium fs-6">{formatDate(task.dueDate)}</div>
                </div>
              </Col>
            </Row>

            {/* People */}
            <Row className="g-3 mb-4">
              <Col sm={6}>
                <div className="text-muted fw-semibold fs-8 mb-1" style={{ letterSpacing: '0.08em' }}>ASSIGNED TO</div>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-xs avatar-soft-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: 'var(--bs-primary-bg-subtle)' }}>
                    <i className="ri-user-line text-primary" style={{ fontSize: 14 }} />
                  </div>
                  <span>{task.assignedTo || '-'}</span>
                </div>
              </Col>
              <Col sm={6}>
                <div className="text-muted fw-semibold fs-8 mb-1" style={{ letterSpacing: '0.08em' }}>REPORTER</div>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-xs avatar-soft-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: 'var(--bs-secondary-bg-subtle)' }}>
                    <i className="ri-user-line text-secondary" style={{ fontSize: 14 }} />
                  </div>
                  <span>{task.reporter || '-'}</span>
                </div>
              </Col>
              {task.createdBy && (
                <Col sm={6}>
                  <div className="text-muted fw-semibold fs-8 mb-1" style={{ letterSpacing: '0.08em' }}>CREATED BY</div>
                  <span>{task.createdBy}</span>
                </Col>
              )}
              {task.relatedCustomerName && (
                <Col sm={6}>
                  <div className="text-muted fw-semibold fs-8 mb-1" style={{ letterSpacing: '0.08em' }}>CUSTOMER</div>
                  <span>{task.relatedCustomerName}</span>
                </Col>
              )}
            </Row>

            {/* Labels */}
            {task.labels?.length > 0 && (
              <div className="mb-4">
                <div className="text-muted fw-semibold fs-8 mb-2" style={{ letterSpacing: '0.08em' }}>LABELS</div>
                <div className="d-flex gap-1 flex-wrap">
                  {task.labels.map((label) => (
                    <Badge key={label} bg="light" text="dark" className="border px-2 py-1">{label}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments & Links */}
            {(task.attachmentName || task.linkUrl) && (
              <div className="mb-2">
                <div className="text-muted fw-semibold fs-8 mb-2" style={{ letterSpacing: '0.08em' }}>ATTACHMENTS & LINKS</div>
                {task.attachmentName && (
                  <div className="d-flex align-items-center gap-3 p-3 border rounded mb-2">
                    <i className="ri-file-line fs-4 text-muted" />
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-medium text-truncate">{task.attachmentName}</div>
                      {task.attachmentType && <div className="text-muted fs-8">{task.attachmentType}</div>}
                    </div>
                    {task.attachmentUrl && (
                      <a href={task.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                        <i className="ri-download-line me-1" />Open
                      </a>
                    )}
                  </div>
                )}
                {task.linkUrl && (
                  <div className="d-flex align-items-center gap-2 p-2">
                    <i className="ri-links-line text-info" />
                    <a href={task.linkUrl} target="_blank" rel="noreferrer" className="text-info text-truncate">{task.linkUrl}</a>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top">
        <Button variant="outline-secondary" onClick={close}>Close</Button>
        <Button variant="primary" onClick={() => { onEdit(task); close(); }}>
          <i className="ri-edit-line me-1" />Edit Task
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskInfo;
