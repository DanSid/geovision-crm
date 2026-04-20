import React, { useState } from 'react';
import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge, Button } from 'react-bootstrap';
import { Clock, AlertCircle, Plus } from 'react-feather';
import { updateTask } from '../../../redux/action/Crm';
import AddNewTask from '../../Todo/AddNewTask';

// ── Jira-like columns ─────────────────────────────────────────────────────────
export const KANBAN_COLUMNS = [
    { id: 'triage',         label: 'Triage',         status: 'To Do',          color: '#6e7891' },
    { id: 'estimate-scope', label: 'Estimate Scope',  status: 'Estimate Scope', color: '#f27935' },
    { id: 'approved',       label: 'Approved',        status: 'Approved',       color: '#0052cc' },
    { id: 'scheduled',      label: 'Scheduled',       status: 'Scheduled',      color: '#8777d9' },
    { id: 'in-progress',    label: 'In Progress',     status: 'In Progress',    color: '#0065ff' },
    { id: 'delivered',      label: 'Delivered',       status: 'Delivered',      color: '#36b37e' },
    { id: 'done',           label: 'Done',            status: 'Completed',      color: '#00875a' },
];

// Map a task's status to a column id
export const statusToColumnId = (status, done) => {
    if (done) return 'done';
    const s = (status || '').toLowerCase().trim();
    if (s === 'done' || s === 'completed') return 'done';
    if (s === 'in progress') return 'in-progress';
    if (s === 'on hold' || s === 'scheduled') return 'scheduled';
    if (s === 'review' || s === 'delivered') return 'delivered';
    if (s === 'approved') return 'approved';
    if (s === 'estimate scope' || s === 'estimate-scope') return 'estimate-scope';
    return 'triage';
};

const columnIdToStatus = (colId) => {
    const col = KANBAN_COLUMNS.find(c => c.id === colId);
    return col ? col.status : 'To Do';
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const priorityVariant = (p) => (
    { Urgent: 'danger', High: 'warning', Medium: 'info', Low: 'secondary' }[p] || 'secondary'
);

const avatarColor = (name) => {
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'pink', 'violet', 'orange'];
    if (!name) return 'primary';
    return colors[name.charCodeAt(0) % colors.length];
};

const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

// ── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, index }) => {
    const overdue = isOverdue(task.dueDate) && !task.done;
    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        background: snapshot.isDragging ? '#e8f0fe' : '#ffffff',
                        border: `1px solid ${overdue ? '#ffcdd2' : '#e8ecf0'}`,
                        borderRadius: 6,
                        padding: '8px 10px',
                        marginBottom: 8,
                        boxShadow: snapshot.isDragging
                            ? '0 4px 12px rgba(0,0,0,0.18)'
                            : '0 1px 3px rgba(0,0,0,0.06)',
                        cursor: 'grab',
                    }}
                >
                    {/* Badges row */}
                    <div className="d-flex align-items-center gap-1 mb-1 flex-wrap">
                        {task.priority && (
                            <Badge bg={priorityVariant(task.priority)} style={{ fontSize: '9px', padding: '2px 5px' }}>
                                {task.priority}
                            </Badge>
                        )}
                        {task.category && task.category !== 'General' && (
                            <Badge bg="light" text="dark" style={{ fontSize: '9px', padding: '2px 5px', border: '1px solid #dee2e6' }}>
                                {task.category}
                            </Badge>
                        )}
                        {overdue && (
                            <span className="ms-auto" title="Overdue">
                                <AlertCircle size={11} color="#e53935" />
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <div
                        className="fw-semibold mb-1"
                        style={{ fontSize: '12px', lineHeight: 1.4, color: '#101828' }}
                    >
                        {task.title || 'Untitled'}
                    </div>

                    {/* Description snippet */}
                    {task.description && (
                        <div
                            className="mb-1"
                            style={{ fontSize: '11px', lineHeight: 1.3, color: '#344054' }}
                        >
                            {task.description.length > 65
                                ? task.description.substring(0, 65) + '…'
                                : task.description}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="d-flex align-items-center justify-content-between mt-2">
                        {task.dueDate ? (
                            <span style={{
                                fontSize: '10px',
                                color: overdue ? '#c62828' : '#475467',
                                display: 'flex', alignItems: 'center', gap: 3,
                            }}>
                                <Clock size={9} />
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        ) : <span />}
                        {task.assignedTo && task.assignedTo !== 'Unassigned' && (
                            <div
                                className={`avatar avatar-xxs avatar-soft-${avatarColor(task.assignedTo)} avatar-rounded`}
                                title={task.assignedTo}
                                style={{ width: 20, height: 20, flexShrink: 0 }}
                            >
                                <span className="initial-wrap" style={{ fontSize: '9px' }}>
                                    {task.assignedTo.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

// ── Column ────────────────────────────────────────────────────────────────────
const KanbanColumn = ({ column, tasks, onAddTask }) => (
    <div
        style={{
            flex: 1,
            minWidth: 140,
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        {/* Column Header */}
        <div className="d-flex align-items-center mb-2 px-1">
            <span style={{
                width: 9, height: 9, borderRadius: '50%',
                background: column.color, display: 'inline-block',
                marginRight: 6, flexShrink: 0,
            }} />
            <span
                className="text-uppercase fw-bold"
                style={{
                    fontSize: '10.5px', color: '#42526e',
                    letterSpacing: '0.5px', flex: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
            >
                {column.label}
            </span>
            <Badge
                bg="light" text="dark"
                className="ms-1 border flex-shrink-0"
                style={{ fontSize: '10px', minWidth: 18, textAlign: 'center' }}
            >
                {tasks.length}
            </Badge>
        </div>

        {/* Droppable area — fills remaining height */}
        <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                        flex: 1,
                        minHeight: 120,
                        background: snapshot.isDraggingOver ? '#ebf2ff' : '#f4f5f7',
                        borderRadius: 6,
                        padding: 6,
                        transition: 'background 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {tasks.map((task, i) => (
                        <TaskCard key={task.id} task={task} index={i} />
                    ))}
                    {provided.placeholder}

                    {/* Add task button */}
                    <button
                        type="button"
                        onClick={() => onAddTask(column)}
                        style={{
                            width: '100%',
                            marginTop: 'auto',
                            paddingTop: 6,
                            paddingBottom: 6,
                            fontSize: '11px',
                            border: '1px dashed #cfd4db',
                            background: 'transparent',
                            color: '#6e7891',
                            borderRadius: 4,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                        }}
                    >
                        <Plus size={11} />
                        Add task
                    </button>
                </div>
            )}
        </Droppable>
    </div>
);

// ── Main Board ────────────────────────────────────────────────────────────────
const Board = ({ tasks = [], updateTask, memberFilter = [] }) => {
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState('To Do');

    // Apply member filter
    const filtered = memberFilter.length === 0
        ? tasks
        : tasks.filter(t => memberFilter.includes(t.assignedTo));

    // Group tasks into columns by status
    const columnTasksMap = KANBAN_COLUMNS.reduce((acc, col) => {
        acc[col.id] = filtered.filter(t => statusToColumnId(t.status, t.done) === col.id);
        return acc;
    }, {});

    // Drag end → update task status in Redux (syncs Task List, Gantt, Summary, Calendar)
    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.droppableId === source.droppableId) return;

        const task = tasks.find(t => String(t.id) === draggableId);
        if (!task) return;

        const newStatus = columnIdToStatus(destination.droppableId);
        const isDone = destination.droppableId === 'done';
        updateTask({ ...task, status: newStatus, done: isDone });
    };

    const onAddTask = (column) => {
        setDefaultStatus(column.status);
        setAddTaskModal(true);
    };

    return (
        <>
            <div className="taskboard-body">
                <div>
                    {/* Toolbar */}
                    <div className="taskbar-toolbar">
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                            <Button
                                variant="soft-primary"
                                className="btn-add-newlist flex-shrink-0"
                                onClick={() => { setDefaultStatus('To Do'); setAddTaskModal(true); }}
                            >
                                <Plus size={14} className="me-1" /> Create Task
                            </Button>
                            {tasks.length > 0 && (
                                <span className="text-muted" style={{ fontSize: 12 }}>
                                    {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
                                    {memberFilter.length > 0 && ` · ${filtered.length} shown`}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Kanban columns */}
                    <div className="tasklist-scroll">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div
                                className="tasklist-wrap"
                                style={{
                                    gap: 10,
                                    width: 'max-content',
                                    minWidth: '100%',
                                    boxSizing: 'border-box',
                                    alignItems: 'flex-start',
                                }}
                            >
                                {KANBAN_COLUMNS.map(col => (
                                    <KanbanColumn
                                        key={col.id}
                                        column={col}
                                        tasks={columnTasksMap[col.id]}
                                        onAddTask={onAddTask}
                                    />
                                ))}
                            </div>
                        </DragDropContext>
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            <AddNewTask
                show={addTaskModal}
                hide={() => setAddTaskModal(false)}
                defaultStatus={defaultStatus}
            />
        </>
    );
};

const mapStateToProps = ({ tasks }) => ({ tasks });
export default connect(mapStateToProps, { updateTask })(Board);
