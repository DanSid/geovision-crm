import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { addTask, updateTask } from '../../redux/action/Crm';
import { normalizeTask, TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from '../../utils/taskData';
import { loadUsers } from '../../redux/action/Auth';

const emptyTask = {
  title: '',
  description: '',
  dueDate: '',
  startDate: '',
  priority: 'Medium',
  status: 'To Do',
  category: 'General',
  labels: '',
  relatedCustomerName: '',
  assignedUserId: '',
  reporterUserId: '',
  linkUrl: '',
  attachmentName: '',
  attachmentType: '',
  attachmentUrl: '',
  attachmentSize: '',
};

const AddNewTask = ({ show, hide, addTask, updateTask, currentUser, editingTask = null, customers = [], defaultStatus }) => {
  const [form, setForm] = useState(emptyTask);
  const attachmentInputRef = useRef(null);
  const users = useMemo(() => loadUsers(), []);

  const teamMembers = useMemo(() => {
    const map = new Map();
    [currentUser, ...users].filter(Boolean).forEach((user) => {
      const id = String(user.id);
      if (!map.has(id)) {
        map.set(id, user);
      }
    });
    return Array.from(map.values());
  }, [users, currentUser]);

  useEffect(() => {
    if (editingTask) {
      setForm({
        ...emptyTask,
        ...editingTask,
        labels: Array.isArray(editingTask.labels) ? editingTask.labels.join(', ') : '',
        assignedUserId: editingTask.assignedUserId ? String(editingTask.assignedUserId) : '',
        reporterUserId: editingTask.reporterUserId ? String(editingTask.reporterUserId) : '',
        startDate: editingTask.startDate || editingTask.start || editingTask.dueDate || '',
      });
    } else {
      setForm({
        ...emptyTask,
        status: defaultStatus || 'To Do',
        dueDate: new Date().toISOString().slice(0, 16),
        startDate: new Date().toISOString().slice(0, 16),
        assignedUserId: currentUser?.id ? String(currentUser.id) : '',
        reporterUserId: currentUser?.id ? String(currentUser.id) : '',
      });
    }
  }, [editingTask, show, currentUser, defaultStatus]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const userFromId = (userId) => teamMembers.find((item) => String(item.id) === String(userId || ''));

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateField('attachmentName', file.name);
      updateField('attachmentType', file.type);
      updateField('attachmentSize', file.size);
      updateField('attachmentUrl', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const clearAttachment = () => {
    updateField('attachmentName', '');
    updateField('attachmentType', '');
    updateField('attachmentSize', '');
    updateField('attachmentUrl', '');
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    try {
      const assignee = userFromId(form.assignedUserId || currentUser?.id);
      const reporter = userFromId(form.reporterUserId || currentUser?.id);
      const safeCustomers = Array.isArray(customers) ? customers : [];
      const relatedCustomer = safeCustomers.find((item) => item.name === form.relatedCustomerName);
      const startDate = form.startDate || form.dueDate || new Date().toISOString();

      const payload = normalizeTask({
        ...form,
        labels: String(form.labels || '').split(',').map((item) => item.trim()).filter(Boolean),
        start: startDate,
        startDate,
        dueDate: form.dueDate || startDate,
        assignedUserId: assignee?.id || currentUser?.id || null,
        assignedTo: assignee?.name || assignee?.username || currentUser?.name || 'Unassigned',
        reporterUserId: reporter?.id || currentUser?.id || null,
        reporter: reporter?.name || reporter?.username || currentUser?.name || 'Unassigned',
        relatedCustomerId: relatedCustomer?.id || null,
        relatedCustomerName: form.relatedCustomerName,
      }, currentUser);

      if (editingTask) updateTask(payload);
      else addTask(payload);
      hide();
    } catch (err) {
      console.error('[AddNewTask] handleSave error:', err);
    }
  };

  return (
    <Modal show={show} onHide={hide} centered size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{editingTask ? 'Edit Task' : 'Add Task'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Task title</Form.Label>
              <Form.Control value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Task title" />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Start date</Form.Label>
              <Form.Control type="datetime-local" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Due date</Form.Label>
              <Form.Control type="datetime-local" value={form.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Priority</Form.Label>
              <Form.Select value={form.priority} onChange={(e) => updateField('priority', e.target.value)}>
                {TASK_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                {TASK_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Assignee</Form.Label>
              <Form.Select value={form.assignedUserId || ''} onChange={(e) => updateField('assignedUserId', e.target.value)}>
                <option value="">Select assignee</option>
                {teamMembers.map((user) => (
                  <option key={user.id} value={String(user.id)}>{user.name || user.username}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Reporter</Form.Label>
              <Form.Select value={form.reporterUserId || ''} onChange={(e) => updateField('reporterUserId', e.target.value)}>
                <option value="">Select reporter</option>
                {teamMembers.map((user) => (
                  <option key={user.id} value={String(user.id)}>{user.name || user.username}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Related customer</Form.Label>
              <Form.Control list="customer-list" value={form.relatedCustomerName || ''} onChange={(e) => updateField('relatedCustomerName', e.target.value)} placeholder="Customer name" />
              <datalist id="customer-list">
                {customers.map((customer) => <option key={customer.id} value={customer.name} />)}
              </datalist>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label>Link</Form.Label>
              <Form.Control type="url" value={form.linkUrl || ''} onChange={(e) => updateField('linkUrl', e.target.value)} placeholder="https://example.com/task-resource" />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Attachment</Form.Label>
              <Form.Control ref={attachmentInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleAttachmentChange} />
              {form.attachmentName ? (
                <div className="d-flex align-items-center justify-content-between gap-2 mt-2 p-2 border rounded">
                  <div className="text-truncate">
                    <strong>{form.attachmentName}</strong>
                    {form.attachmentType ? <div className="text-muted fs-8">{form.attachmentType}</div> : null}
                  </div>
                  <Button variant="outline-secondary" size="sm" onClick={clearAttachment}>Remove</Button>
                </div>
              ) : (
                <div className="text-muted fs-8 mt-2">Upload a document or picture. The file will be stored as attachment metadata for this task.</div>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Labels</Form.Label>
              <Form.Control value={form.labels} onChange={(e) => updateField('labels', e.target.value)} placeholder="Comma separated labels" />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Task notes" />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={hide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={!form.title.trim()}>Save Task</Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapState = ({ auth, customers }) => ({ currentUser: auth.currentUser, customers });
export default connect(mapState, { addTask, updateTask })(AddNewTask);
