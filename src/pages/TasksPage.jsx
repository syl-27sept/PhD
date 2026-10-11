import { useEffect, useId, useRef, useState } from 'react';

const taskStatuses = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' }
];

function TaskStatusControl({ status, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const controlRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();
  const selectedStatus = taskStatuses.find((option) => option.value === status) || taskStatuses[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!controlRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) controlRef.current?.querySelector('[role="menuitemradio"]')?.focus();
  }, [isOpen]);

  const handleMenuKeyDown = (event) => {
    const options = [...controlRef.current.querySelectorAll('[role="menuitemradio"]')];
    const currentIndex = options.indexOf(document.activeElement);
    let nextIndex;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % options.length;
    if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + options.length) % options.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = options.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      options[nextIndex].focus();
    }
  };

  const chooseStatus = (nextStatus) => {
    onChange(nextStatus);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="task-status-control" ref={controlRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`task-status-pill status-${selectedStatus.value}`}
        aria-label={`Change status, currently ${selectedStatus.label}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        {selectedStatus.label}
      </button>
      {isOpen && (
        <div id={menuId} className="task-status-menu" role="menu" onKeyDown={handleMenuKeyDown}>
          {taskStatuses.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`task-status-option status-${option.value}`}
              role="menuitemradio"
              aria-checked={status === option.value}
              onClick={() => chooseStatus(option.value)}
            >
              <span className="task-status-dot" aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TasksPage({
  taskFilter,
  taskForm,
  taskDialogOpen,
  filteredTasks,
  onTaskFilter,
  onTaskDialogToggle,
  onTaskFormChange,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask
}) {
  return (
    <section className="page">
      <div className="card">
        <div className="card-head">
          <h2>Tasks</h2>
          <button type="button" className="button" onClick={() => onTaskDialogToggle((current) => !current)}>
            + Add Task
          </button>
        </div>

        {taskDialogOpen && (
          <form className="task-form" onSubmit={onAddTask}>
            <input type="text" value={taskForm.title} onChange={(event) => onTaskFormChange('title', event.target.value)} placeholder="Task name" required />
            <textarea value={taskForm.description} onChange={(event) => onTaskFormChange('description', event.target.value)} placeholder="Description" rows="3" />
            <div className="form-row">
              <input type="date" value={taskForm.due_date} onChange={(event) => onTaskFormChange('due_date', event.target.value)} />
              <select value={taskForm.status} onChange={(event) => onTaskFormChange('status', event.target.value)}>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="dialog-actions">
              <button type="button" className="button secondary" onClick={() => onTaskDialogToggle(false)}>Cancel</button>
              <button type="submit" className="button">Save task</button>
            </div>
          </form>
        )}

        <div className="section-tools">
          <select value={taskFilter} onChange={(event) => onTaskFilter(event.target.value)} aria-label="Filter tasks">
            <option value="all">All tasks</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Completed</option>
          </select>
        </div>

        <div className="list">
          {filteredTasks.length ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="list-item">
                <div className="task-row-heading">
                  <strong>{task.title}</strong>
                  <TaskStatusControl
                    status={task.status}
                    onChange={(status) => onUpdateTaskStatus(task.id, status)}
                  />
                </div>
                {task.description ? <div className="muted">{task.description}</div> : null}
                <div className="muted">{task.due_date ? `Due: ${task.due_date}` : 'No due date'}</div>
                <div className="task-actions">
                  <button type="button" className="button secondary" onClick={() => onDeleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No tasks yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TasksPage;
