import React, { useState } from 'react';
import { Button, Nav } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import * as Icons from 'react-feather';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import HkBadge from '../../../components/@hk-badge/@hk-badge';
import AddNewTask from '../AddNewTask';

const TodoSidebar = ({ tasks = [], currentUser, activeFilter, setActiveFilter }) => {
  const [showModal, setShowModal] = useState(false);
  const myTasks = tasks.filter((task) => !currentUser || task.assignedUserId === currentUser.id || task.createdByUserId === currentUser.id);

  const priorityCount = (priority) => tasks.filter((task) => task.priority === priority).length;

  return (
    <>
      <nav className="todoapp-sidebar">
        <SimpleBar className="nicescroll-bar">
          <div className="menu-content-wrap">
            <Button variant="primary" className="btn-rounded btn-block mb-4" onClick={() => setShowModal(true)}>Add Task</Button>
            <div className="menu-group">
              <Nav className="nav-light navbar-nav flex-column">
                <Nav.Item className={activeFilter === 'all' ? 'active' : ''}><Nav.Link onClick={() => setActiveFilter('all')}><Icons.Layout size={16} className="me-2" />All Tasks</Nav.Link></Nav.Item>
                <Nav.Item className={activeFilter === 'mine' ? 'active' : ''}><Nav.Link onClick={() => setActiveFilter('mine')}><Icons.List size={16} className="me-2" />My Tasks <span className="ms-auto">{myTasks.length}</span></Nav.Link></Nav.Item>
                <Nav.Item className={activeFilter === 'open' ? 'active' : ''}><Nav.Link onClick={() => setActiveFilter('open')}><Icons.Clock size={16} className="me-2" />Open Tasks</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/apps/calendar"><Icons.Calendar size={16} className="me-2" />Calendar</Nav.Link></Nav.Item>
              </Nav>
            </div>
            <div className="separator separator-light" />
            <div className="title-sm text-primary">Priority</div>
            <div className="menu-group">
              <Nav className="nav-light navbar-nav flex-column">
                {['Urgent', 'High', 'Medium', 'Low'].map((label) => (
                  <Nav.Item key={label}>
                    <Nav.Link className="link-with-badge" onClick={() => setActiveFilter(label.toLowerCase())}>
                      <HkBadge indicator bg={label === 'Urgent' ? 'danger' : label === 'High' ? 'orange' : label === 'Medium' ? 'warning' : 'secondary'} className="badge-indicator-lg me-2" />
                      <span className="nav-link-text">{label}</span>
                      <span className="ms-auto">{priorityCount(label)}</span>
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </div>
          </div>
        </SimpleBar>
      </nav>
      <AddNewTask show={showModal} hide={() => setShowModal(false)} />
    </>
  );
};

const mapState = ({ tasks, auth }) => ({ tasks, currentUser: auth.currentUser });
export default connect(mapState)(TodoSidebar);
