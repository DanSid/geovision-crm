import React from 'react';
import { Badge, Button, Card, Form, Pagination, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { deleteTask, toggleTask } from '../../../redux/action/Crm';
import { priorityColor, sortTasksByDate, statusColor } from '../../../utils/taskData';

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

const Body = ({ tasks = [], showInfo, onEdit, onAddTask = () => {}, toggleTask, deleteTask }) => {
  const ordered = sortTasksByDate(tasks);

  return (
    <div className="todo-body">
      <div className="container-fluid py-3">
        <div className="todo-toolbar">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button size="sm" variant="primary" className="px-4 fw-semibold" onClick={onAddTask}>Add Task</Button>
            <Button size="sm" variant="outline-light">Bulk actions</Button>
            <Button size="sm" variant="outline-light">Apply</Button>
          </div>
          <div className="paging-info">{ordered.length ? `1 - ${ordered.length} of ${ordered.length}` : '0 tasks'}</div>
        </div>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {ordered.length === 0 ? (
              <div className="text-center py-5 text-muted">No tasks found for this view.</div>
            ) : (
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Task</th>
                    <th>Assigned To</th>
                    <th>Reporter</th>
                    <th>Start</th>
                    <th>Due</th>
                    <th>Attachment</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((task) => (
                    <tr key={task.id}>
                      <td><Form.Check checked={!!task.done} onChange={() => toggleTask(task.id)} /></td>
                      <td>
                        <div className="fw-medium cursor-pointer" onClick={() => showInfo(task)}>{task.title}</div>
                        <div className="text-muted fs-7 text-truncate" style={{ maxWidth: 300 }}>{task.description || '-'}</div>
                      </td>
                      <td>{task.assignedTo || '-'}</td>
                      <td>{task.reporter || '-'}</td>
                      <td>{formatDate(task.startDate || task.start)}</td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {task.attachmentName ? (
                            <Badge bg="light" text="dark" className="border text-start text-truncate d-inline-flex align-items-center gap-1" style={{ maxWidth: 220 }}>
                              <i className="ri-attachment-2" />
                              <span className="text-truncate">{task.attachmentName}</span>
                            </Badge>
                          ) : null}
                          {task.linkUrl ? (
                            <a href={task.linkUrl} target="_blank" rel="noreferrer" className="fs-7 text-info text-decoration-none text-truncate" style={{ maxWidth: 220 }}>
                              Open link
                            </a>
                          ) : null}
                          {!task.attachmentName && !task.linkUrl ? '-' : null}
                        </div>
                      </td>
                      <td><Badge bg={priorityColor(task.priority)}>{task.priority}</Badge></td>
                      <td><Badge bg={statusColor(task.status)}>{task.status}</Badge></td>
                      <td>{task.category || '-'}</td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          <Button size="sm" variant="outline-info" className="d-inline-flex align-items-center gap-1" onClick={() => showInfo(task)}>
                            <i className="ri-eye-line" />
                            <span>View</span>
                          </Button>
                          <Button size="sm" variant="outline-primary" className="d-inline-flex align-items-center gap-1" onClick={() => onEdit(task)}>
                            <i className="ri-edit-line" />
                            <span>Edit</span>
                          </Button>
                          <Button size="sm" variant="outline-danger" className="d-inline-flex align-items-center gap-1" onClick={() => deleteTask(task.id)}>
                            <i className="ri-delete-bin-line" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
        <div className="mt-3 d-flex justify-content-end"><Pagination className="custom-pagination pagination-simple active-theme"><Pagination.Item active>1</Pagination.Item></Pagination></div>
      </div>
    </div>
  );
};

export default connect(null, { toggleTask, deleteTask })(Body);
