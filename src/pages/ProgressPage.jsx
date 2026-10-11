function ProgressPage({ roadmap, overallProgress, getYearProgress, getGoalProgress, getMilestoneProgress, toggleMilestone, updateRoadmapTaskStatus }) {
  return (
    <section className="page">
      <div className="card">
        <div className="card-head">
          <div>
            <h2>PhD Progress</h2>
            <p className="muted">Four-year roadmap for your PhD journey.</p>
          </div>
          <strong>{overallProgress}%</strong>
        </div>
        <div className="progress" role="progressbar" aria-label="Overall roadmap progress" aria-valuenow={overallProgress}>
          <div style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="weighting-explanation">
          <h3>How PhD progress is calculated</h3>
          <p className="muted">Progress is calculated hierarchically. Individual task progress contributes to milestones, milestones contribute to goals, goals contribute to academic years, and the years contribute to your overall PhD progress.</p>
          <p className="muted">Each year, goal, milestone and roadmap task has an importance weight. A weight of 3 gives an item three times the influence of an item weighted 1 within the same parent level.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Research roadmap</h2>
            <p className="muted">Organise your research into years, goals, milestones and actionable tasks.</p>
          </div>
        </div>

        <div className="list">
          {roadmap.map((year) => (
            <section key={year.id} className="roadmap-year">
              <div className="roadmap-year-head">
                <div>
                  <span className="eyebrow">{year.year} · Weight {year.weight}</span>
                  <h3>{year.title}</h3>
                </div>
                <div className="roadmap-actions">
                  <strong>{getYearProgress(year)}%</strong>
                </div>
              </div>

              <div className="progress"><div style={{ width: `${getYearProgress(year)}%` }} /></div>

              {year.goals.length ? (
                year.goals.map((goal) => (
                  <details key={goal.id} className="roadmap-goal" open>
                    <summary>
                      <span>
                        <strong>{goal.title}</strong>
                        <span className="muted"> · Weight {goal.weight}</span>
                      </span>
                      <strong>{getGoalProgress(goal)}%</strong>
                    </summary>
                    {goal.description ? <p className="muted">{goal.description}</p> : null}
                    <div className="progress"><div style={{ width: `${getGoalProgress(goal)}%` }} /></div>

                    {goal.milestones.length ? (
                      goal.milestones.map((milestone) => (
                        <article key={milestone.id} className="roadmap-milestone">
                          <div className="milestone-heading">
                            <label className="milestone-check">
                              <input
                                type="checkbox"
                                checked={Boolean(milestone.completed)}
                                onChange={(event) => toggleMilestone(year.id, goal.id, milestone.id, event.target.checked)}
                              />
                              <span><strong>{milestone.name}</strong></span>
                            </label>
                            <strong>{getMilestoneProgress(milestone)}%</strong>
                          </div>
                          <div className="muted">Importance weight: {milestone.weight}</div>
                          <p className="muted"><strong>Completion criteria:</strong> {milestone.criteria || 'Not defined yet'}</p>
                          {milestone.due_date ? <p className="muted">Due: {milestone.due_date}</p> : null}
                          <div className="progress"><div style={{ width: `${getMilestoneProgress(milestone)}%` }} /></div>

                          <div className="roadmap-tasks">
                            {milestone.tasks.length ? (
                              milestone.tasks.map((task) => (
                                <div key={task.id} className="roadmap-task">
                                  <div className="roadmap-task-main">
                                    <strong>{task.title}</strong>
                                    {task.description ? <div className="muted">{task.description}</div> : null}
                                    {task.due_date ? <div className="muted">Due: {task.due_date}</div> : null}
                                  </div>
                                  <div className="roadmap-task-controls">
                                    <select value={task.status || 'todo'} onChange={(event) => updateRoadmapTaskStatus(year.id, goal.id, milestone.id, task.id, event.target.value)}>
                                      <option value="todo">To do</option>
                                      <option value="in_progress">In progress</option>
                                      <option value="done">Done</option>
                                    </select>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="empty">No tasks yet. Add concrete actions to track progress.</div>
                            )}
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty">No milestones yet.</div>
                    )}
                  </details>
                ))
              ) : (
                <div className="empty">No goals yet. Add a goal to start planning this year.</div>
              )}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProgressPage;
