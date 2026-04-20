import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import TaskInfo from './TaskInfo';
import TodoHeader from './TodoHeader';
import TodoSidebar from './TodoSidebar';
import Body from './Body';
import AddNewTask from '../AddNewTask';

const TaskList = ({ tasks = [], currentUser }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = !query || [
        task.title,
        task.description,
        task.assignedTo,
        task.reporter,
        task.category,
        task.linkUrl,
        task.attachmentName,
        task.relatedCustomerName,
      ].filter(Boolean).some((v) => String(v).toLowerCase().includes(query));
      if (!matchesSearch) return false;
      if (activeFilter === 'mine') return currentUser ? String(task.assignedUserId) === String(currentUser.id) || String(task.createdByUserId) === String(currentUser.id) : true;
      if (activeFilter === 'open') return task.status !== 'Completed' && !task.done;
      if (['urgent', 'high', 'medium', 'low'].includes(activeFilter)) return (task.priority || '').toLowerCase() === activeFilter;
      return true;
    });
  }, [tasks, search, activeFilter, currentUser]);

  return (
    <div className="hk-pg-body py-0">
      <div className={classNames('todoapp-wrap', { 'todoapp-sidebar-toggle': showSidebar })}>
        <TodoSidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <div className="todoapp-content">
          <div className="todoapp-detail-wrap">
            <TodoHeader toggleSidebar={() => setShowSidebar(!showSidebar)} showSidebar={showSidebar} activeFilter={activeFilter} setActiveFilter={setActiveFilter} search={search} setSearch={setSearch} />
            <Body tasks={filteredTasks} showInfo={setSelectedTask} onEdit={setEditingTask} onAddTask={() => setCreatingTask(true)} />
          </div>
        </div>
      </div>
      <TaskInfo task={selectedTask} close={() => setSelectedTask(null)} onEdit={(task) => { setSelectedTask(null); setEditingTask(task); }} />
      <AddNewTask show={creatingTask} hide={() => setCreatingTask(false)} />
      <AddNewTask show={!!editingTask} hide={() => setEditingTask(null)} editingTask={editingTask} />
    </div>
  );
};

const mapState = ({ tasks, auth }) => ({ tasks, currentUser: auth.currentUser });
export default connect(mapState)(TaskList);
