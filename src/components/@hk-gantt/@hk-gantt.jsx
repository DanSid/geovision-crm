import React from 'react';

const HkGantt = ({ tasks = [] }) => (
  <div className="border rounded p-3 bg-white">
    <div className="fw-semibold mb-2">Gantt preview</div>
    {tasks.length === 0 ? (
      <div className="text-muted">No tasks available.</div>
    ) : (
      <div className="d-flex flex-column gap-2">
        {tasks.map((task) => (
          <div key={task.id || task.name} className="border rounded p-2 bg-light">
            <div className="fw-medium">{task.name}</div>
            <div className="text-muted fs-7">{task.start} - {task.end} • {task.progress || 0}%</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default HkGantt;
