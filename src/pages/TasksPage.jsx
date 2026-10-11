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
                <strong>{task.title}</strong>
                {task.description ? <div className="muted">{task.description}</div> : null}
                <div className="muted">{task.due_date ? `Due: ${task.due_date}` : 'No due date'}</div>
                <div className="task-actions">
                  <select value={task.status} onChange={(event) => onUpdateTaskStatus(task.id, event.target.value)}>
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
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
