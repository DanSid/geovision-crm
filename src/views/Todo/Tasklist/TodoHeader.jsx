import React from 'react';
import classNames from 'classnames';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import { toggleTopNav } from '../../../redux/action/Theme';

const labels = {
  all: 'All Tasks',
  mine: 'My Tasks',
  open: 'Open Tasks',
  urgent: 'Urgent Priority',
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
};

const TodoHeader = ({ topNavCollapsed, toggleTopNav, toggleSidebar, showSidebar, activeFilter, setActiveFilter, search, setSearch }) => (
  <header className="todo-header">
    <div className="d-flex align-items-center">
      <Dropdown>
        <Dropdown.Toggle as="button" className="todoapp-title link-dark border-0 bg-transparent p-0">
          <h1 className="mb-0">{labels[activeFilter] || 'All Tasks'}</h1>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.entries(labels).map(([key, value]) => (
            <Dropdown.Item key={key} onClick={() => setActiveFilter(key)}>{value}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
    <div className="todo-options-wrap">
      <Form className="d-sm-block d-none" role="search">
        <Form.Control type="text" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Form>
      <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable" onClick={() => toggleTopNav(!topNavCollapsed)}>
        <HkTooltip placement={topNavCollapsed ? 'bottom' : 'top'} title="Collapse">
          <span className="icon"><span className="feather-icon">{topNavCollapsed ? <ChevronDown /> : <ChevronUp />}</span></span>
        </HkTooltip>
      </Button>
    </div>
    <div className={classNames('hk-sidebar-togglable', { active: showSidebar })} onClick={toggleSidebar} />
  </header>
);

const mapStateToProps = ({ theme }) => ({ topNavCollapsed: theme.topNavCollapsed });
export default connect(mapStateToProps, { toggleTopNav })(TodoHeader);
