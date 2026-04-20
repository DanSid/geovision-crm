import React, { useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import { connect } from 'react-redux';
import { ganttViewMode } from '../../../redux/action/ToDo';
import { updateTask } from '../../../redux/action/Crm';
import HkGantt from '../../../components/@hk-gantt/@hk-gantt';

const toGanttDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    try { return new Date(dateStr).toISOString().slice(0, 10); }
    catch { return new Date().toISOString().slice(0, 10); }
};

// Map progress % back to a status string so Task List / Kanban stay in sync
const progressToStatus = (progress) => {
    if (progress >= 100) return 'Completed';
    if (progress >= 50)  return 'In Progress';
    if (progress >= 25)  return 'On Hold';
    return 'To Do';
};

const taskToGantt = (task) => ({
    id: String(task.id),
    name: task.title || 'Untitled',
    start: toGanttDate(task.startDate || task.start),
    end: toGanttDate(task.dueDate || task.end || task.startDate || task.start),
    progress:
        task.done || task.status === 'Completed' ? 100 :
        task.status === 'In Progress'  ? 50  :
        task.status === 'On Hold'      ? 25  : 0,
});

const GanttChart = ({ ganttViewMode, vm, tasks = [], updateTask }) => {
    useEffect(() => {
        const element = document.querySelector('#split_2 .simplebar-content-wrapper');
        if (element) element.scrollTo({ left: 500, behavior: 'smooth' });
    });

    const ganttTasks = tasks.map(taskToGantt);

    // Progress bar dragged in Gantt → update status + done flag in Redux
    const handleProgressChange = (ganttTask, progress) => {
        const original = tasks.find(t => String(t.id) === String(ganttTask.id));
        if (!original) return;
        const newStatus = progressToStatus(progress);
        updateTask({
            ...original,
            status: newStatus,
            done: newStatus === 'Completed',
        });
    };

    // Date bar dragged in Gantt → update startDate / dueDate in Redux
    const handleDateChange = (ganttTask, start, end) => {
        const original = tasks.find(t => String(t.id) === String(ganttTask.id));
        if (!original) return;
        updateTask({
            ...original,
            startDate: start ? new Date(start).toISOString() : original.startDate,
            dueDate:   end   ? new Date(end).toISOString()   : original.dueDate,
            end:       end   ? new Date(end).toISOString()   : original.end,
        });
    };

    return (
        <SimpleBar autoHide={false} style={{ maxHeight: '100vh' }} className="split" id="split_2">
            <div className="gantt-wrap">
                <span className="gantt-container">
                    <span className="gantt">
                        <HkGantt
                            tasks={ganttTasks}
                            viewMode={vm}
                            onProgressChange={handleProgressChange}
                            onDateChange={handleDateChange}
                        />
                    </span>
                </span>
            </div>
        </SimpleBar>
    );
};

const mapStateToProps = ({ toDoReducer, tasks }) => ({
    vm: toDoReducer.vm,
    tasks,
});

export default connect(mapStateToProps, { ganttViewMode, updateTask })(GanttChart);
