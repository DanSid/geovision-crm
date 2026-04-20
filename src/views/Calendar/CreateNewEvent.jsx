import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { addTask } from '../../redux/action/Crm';
import { normalizeTask } from '../../utils/taskData';

const CreateNewEvent = ({ show, hide, addTask, currentUser, initialDate }) => {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', status: 'To Do', category: 'General' });

  useEffect(() => {
    setForm((prev) => ({ ...prev, dueDate: initialDate || new Date().toISOString().slice(0, 16) }));
  }, [initialDate, show]);

  const save = () => {
    addTask(normalizeTask({
      ...form,
      start: form.dueDate,
      end: form.dueDate,
    }, currentUser));
    hide();
  };

  return (
    <Modal show={show} onHide={hide} centered>
      <Modal.Header closeButton><Modal.Title>Add Task to Calendar</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}><Form.Group><Form.Label>Title</Form.Label><Form.Control value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></Form.Group></Col>
          <Col md={12}><Form.Group><Form.Label>Date & time</Form.Label><Form.Control type="datetime-local" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Status</Form.Label><Form.Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><option>To Do</option><option>In Progress</option><option>Completed</option><option>On Hold</option></Form.Select></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Priority</Form.Label><Form.Select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></Form.Select></Form.Group></Col>
          <Col md={12}><Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Form.Group></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={hide}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={!form.title.trim()}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapState = ({ auth }) => ({ currentUser: auth.currentUser });
export default connect(mapState, { addTask })(CreateNewEvent);
