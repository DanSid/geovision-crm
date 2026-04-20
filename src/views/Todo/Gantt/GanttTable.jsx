import React from 'react';
import SimpleBar from 'simplebar-react';
import { connect } from 'react-redux';
import HkDataTable from '../../../components/@hk-data-table';
import { columns } from './GanttData';
import { sortTasksByDate } from '../../../utils/taskData';

const statusVariant = (status) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'warning';
        case 'On Hold': return 'info';
        default: return 'secondary';
    }
};

const avatarBg = (name = '') => {
    const palette = ['primary', 'success', 'warning', 'danger', 'info', 'purple', 'pink'];
    return palette[(name.charCodeAt(0) || 0) % palette.length];
};

const taskToRow = (task) => ({
    starred: !!task.done,
    task: task.title || 'Untitled',
    priority: task.priority || null,
    assignee: [{
        cstmAvt: (task.assignedTo || 'U').charAt(0).toUpperCase(),
        avtBg: avatarBg(task.assignedTo),
        userName: task.assignedTo || 'Unassigned',
    }],
    due_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-',
    status: [{ status: task.status || 'To Do', variant: statusVariant(task.status) }],
    actions: [{ archiveLink: '#', editLink: '#', deleteLink: '#' }],
});

const GanttTable = ({ tasks = [] }) => {
    const sorted = sortTasksByDate(tasks);
    const rowData = sorted.map(taskToRow);

    return (
        <SimpleBar autoHide={false} style={{ maxHeight: '100vh' }} className="split">
            {rowData.length === 0 ? (
                <div className="text-center py-5 text-muted">No tasks yet. Add a task to get started.</div>
            ) : (
                <HkDataTable
                    column={columns}
                    rowData={rowData}
                    rowSelection={true}
                    markStarred={true}
                    classes="table-wrap gt-todo-table nowrap"
                />
            )}
        </SimpleBar>
    );
};

const mapStateToProps = ({ tasks }) => ({ tasks });
export default connect(mapStateToProps)(GanttTable);
