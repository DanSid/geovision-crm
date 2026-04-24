export const TASK_STATUSES = ['To Do', 'Estimate Scope', 'Approved', 'Scheduled', 'In Progress', 'Delivered', 'Completed', 'On Hold'];
export const TASK_PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];
export const TASK_CATEGORIES = ['Calls', 'Meetings', 'Project', 'Follow-up', 'General'];

export const priorityColor = (priority) => {
  switch (priority) {
    case 'Urgent': return 'danger';
    case 'High': return 'orange';
    case 'Medium': return 'warning';
    case 'Low': return 'secondary';
    default: return 'secondary';
  }
};

export const statusColor = (status) => {
  switch (status) {
    case 'Completed':      return 'success';
    case 'Delivered':      return 'success';
    case 'In Progress':    return 'warning';
    case 'On Hold':        return 'secondary';
    case 'Scheduled':      return 'violet';
    case 'Approved':       return 'primary';
    case 'Estimate Scope': return 'orange';
    case 'To Do':          return 'info';
    default:               return 'info';
  }
};

export const normalizeTask = (task = {}, currentUser = null) => {
  const dueDate = task.dueDate || task.start || new Date().toISOString();
  const startDate = task.startDate || task.start || dueDate;
  const status = task.status || (task.done ? 'Completed' : 'To Do');
  return {
    id: task.id || Date.now(),
    title: task.title || task.task_name || 'Untitled Task',
    description: task.description || '',
    dueDate,
    start: startDate,
    startDate,
    end: dueDate,
    priority: task.priority || 'Medium',
    status,
    done: task.done ?? status === 'Completed',
    category: task.category || 'General',
    labels: Array.isArray(task.labels) ? task.labels : [],
    assignedTo: task.assignedTo || currentUser?.name || 'Unassigned',
    assignedUserId: task.assignedUserId || currentUser?.id || null,
    reporter: task.reporter || currentUser?.name || 'Unassigned',
    reporterUserId: task.reporterUserId || currentUser?.id || null,
    createdBy: task.createdBy || currentUser?.name || 'System',
    createdByUserId: task.createdByUserId || currentUser?.id || null,
    createdAt: task.createdAt || new Date().toISOString(),
    relatedCustomerId: task.relatedCustomerId || null,
    relatedCustomerName: task.relatedCustomerName || '',
    attachmentName: task.attachmentName || '',
    attachmentType: task.attachmentType || '',
    attachmentUrl: task.attachmentUrl || '',
    attachmentSize: task.attachmentSize || null,
    linkUrl: task.linkUrl || '',
  };
};

export const sortTasksByDate = (tasks = []) => {
  return [...tasks].sort((a, b) => new Date(a.dueDate || a.start || 0) - new Date(b.dueDate || b.start || 0));
};

export const tasksToCalendarEvents = (tasks = []) => tasks.map((task) => ({
  id: String(task.id),
  title: task.title,
  start: task.startDate || task.start || task.dueDate,
  end: task.dueDate || task.end || task.startDate || task.start,
  allDay: false,
  backgroundColor: task.status === 'Completed' ? '#198754' : task.priority === 'Urgent' ? '#dc3545' : task.priority === 'High' ? '#fd7e14' : '#0d6efd',
  borderColor: task.status === 'Completed' ? '#198754' : task.priority === 'Urgent' ? '#dc3545' : task.priority === 'High' ? '#fd7e14' : '#0d6efd',
  extendedProps: {
    type: 'task',
    task,
  },
}));

export const opportunitiesToCalendarEvents = (opportunities = []) => opportunities.map((opportunity) => ({
  id: `opportunity-${opportunity.id}`,
  title: opportunity.name || 'Opportunity',
  start: opportunity.startDate || opportunity.start || opportunity.createdAt || opportunity.closeDate,
  end: opportunity.expectedCloseDate || opportunity.closeDate || opportunity.end || opportunity.startDate || opportunity.start,
  allDay: false,
  backgroundColor: opportunity.stage === 'Closed Won' ? '#198754' : opportunity.stage === 'Closed Lost' ? '#dc3545' : '#0d6efd',
  borderColor: opportunity.stage === 'Closed Won' ? '#198754' : opportunity.stage === 'Closed Lost' ? '#dc3545' : '#0d6efd',
  extendedProps: {
    type: 'opportunity',
    opportunity,
  },
}));

/* ── Colour per activity type ─────────────────────────────────────────── */
const ACTIVITY_TYPE_COLORS = {
  Meeting: '#4f46e5',  // indigo
  Call:    '#059669',  // green
  Email:   '#0891b2',  // teal
  'To-Do': '#d97706',  // amber
};

/**
 * Convert CRM activities (date/time fields) to FullCalendar event objects.
 *
 * Activities can store the date as:
 *  a) ISO datetime: "2026-04-24T13:32"  (from the quick-create bar datetime-local)
 *  b) Date-only + separate time: date="2026-04-24", time="13:32"  (from ActivitiesTab form)
 *  c) Legacy: item.start  (original format, preserved for backward compat)
 */
export const activitiesToCalendarEvents = (activities = []) =>
  activities
    .filter(item => item.start || item.date)   // must have some date
    .map((item) => {
      // Build start datetime string
      let start = item.start; // legacy
      if (!start) {
        const d = String(item.date || '');
        if (d.includes('T')) {
          start = d;                            // already ISO datetime
        } else if (item.time) {
          start = `${d}T${item.time}`;          // combine date + time
        } else {
          start = d;                            // date-only → all-day
        }
      }
      const allDay = !(start && start.includes('T'));
      const color  = ACTIVITY_TYPE_COLORS[item.type] || '#6f42c1';
      return {
        id:              `activity-${item.id || item._id}`,
        title:           `${item.type ? `[${item.type}] ` : ''}${item.title || 'Activity'}`,
        start,
        end:             item.end || start,
        allDay,
        backgroundColor: color,
        borderColor:     color,
        extendedProps: {
          type:     'activity',
          activity: item,
        },
      };
    });
