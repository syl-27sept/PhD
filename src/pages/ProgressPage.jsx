import { useMemo, useState } from 'react';

function ProgressPage({
  roadmap,
  overallProgress,
  getYearProgress,
  getGoalProgress,
  getMilestoneProgress,
  toggleMilestone,
  updateRoadmapTaskStatus,
  onAddMilestone
}) {
  const [addingToGoal, setAddingToGoal] = useState(null);
  const [milestoneName, setMilestoneName] = useState('');
  const [openYears, setOpenYears] = useState(() => new Set(roadmap[0] ? [roadmap[0].id] : []));

  const currentYear = useMemo(
    () => roadmap.find((year) => getYearProgress(year) < 100) || roadmap[roadmap.length - 1],
    [roadmap, getYearProgress]
  );

  const nextMilestone = useMemo(() => {
    for (const year of roadmap) {
      for (const goal of year.goals || []) {
        const milestone = (goal.milestones || []).find((item) => !item.completed);
        if (milestone) return milestone;
      }
    }
    return null;
  }, [roadmap]);

  const upcomingDeadline = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return roadmap
      .flatMap((year) => year.goals || [])
      .flatMap((goal) => goal.milestones || [])
      .filter((milestone) => milestone.due_date)
      .map((milestone) => ({ ...milestone, deadline: new Date(`${milestone.due_date}T00:00:00`) }))
      .filter((milestone) => !Number.isNaN(milestone.deadline.getTime()) && milestone.deadline >= today)
      .sort((a, b) => a.deadline - b.deadline)[0] || null;
  }, [roadmap]);

  const submitMilestone = (event, yearId, goalId) => {
    event.preventDefault();
    const name = milestoneName.trim();
    if (!name) return;

    onAddMilestone(yearId, goalId, name);
    setMilestoneName('');
    setAddingToGoal(null);
  };

  return (
    <section className="page progress-page">
      <section className="progress-overview" aria-label="PhD progress summary">
        <article className="progress-summary-card progress-summary-total">
          <span className="eyebrow">Overall complete</span>
          <strong className="progress-summary-value">{overallProgress}%</strong>
          <div
            className="progress"
            role="progressbar"
            aria-label="Overall roadmap progress"
            aria-valuenow={overallProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div style={{ width: `${overallProgress}%` }} />
          </div>
        </article>
        <article className="progress-summary-card">
          <span className="eyebrow">Current year</span>
          <strong>{currentYear?.year || 'Not set'}</strong>
          <span className="progress-summary-detail">{currentYear?.title || 'Add a year to your roadmap'}</span>
        </article>
        <article className="progress-summary-card">
          <span className="eyebrow">Next milestone</span>
          <strong>{nextMilestone?.name || 'All milestones complete'}</strong>
          <span className="progress-summary-detail">{nextMilestone ? `${getMilestoneProgress(nextMilestone)}% complete` : 'You have reached this milestone'}</span>
        </article>
        <article className="progress-summary-card">
          <span className="eyebrow">Upcoming deadline</span>
          <strong>{upcomingDeadline?.due_date || 'No deadline set'}</strong>
          <span className="progress-summary-detail">{upcomingDeadline?.name || 'Add a due date to a milestone'}</span>
        </article>
      </section>

      <section className="roadmap-section">
        <header className="roadmap-section-head">
          <div>
            <h2>Research roadmap</h2>
            <p className="muted">Your goals and milestones, organised by year.</p>
          </div>
          <details className="progress-help">
            <summary aria-label="How progress is calculated">How progress works</summary>
            <div className="progress-help-popover">
              <p>Task progress contributes to milestones, milestones to goals, and goals to academic years. Each item is weighted by its importance within its parent level.</p>
              <p>A weight of 3 has three times the influence of a weight of 1.</p>
            </div>
          </details>
        </header>

        <div className="roadmap-years">
          {roadmap.map((year) => {
            const yearProgress = getYearProgress(year);
            const goalCount = (year.goals || []).length;
            const milestoneCount = (year.goals || []).reduce(
              (total, goal) => total + (goal.milestones || []).length,
              0
            );

            return (
              <section key={year.id} className="roadmap-year-card">
                <button
                  type="button"
                  className="roadmap-year-summary"
                  aria-expanded={openYears.has(year.id)}
                  onClick={() => setOpenYears((current) => {
                    const next = new Set(current);
                    if (next.has(year.id)) next.delete(year.id);
                    else next.add(year.id);
                    return next;
                  })}
                >
                  <span className="year-summary-chevron" aria-hidden="true">›</span>
                  <span className="year-summary-main">
                    <span className="eyebrow">{year.year} · Weight {year.weight}</span>
                    <strong>{year.title}</strong>
                    <span className="muted">{goalCount} {goalCount === 1 ? 'goal' : 'goals'} · {milestoneCount} {milestoneCount === 1 ? 'milestone' : 'milestones'}</span>
                  </span>
                  <span className="year-summary-progress">
                    <strong>{yearProgress}%</strong>
                    <span className="progress" aria-hidden="true"><span style={{ width: `${yearProgress}%` }} /></span>
                  </span>
                </button>

                {openYears.has(year.id) ? <div className="roadmap-year-content">
                  {goalCount ? (
                    year.goals.map((goal) => {
                      const goalProgress = getGoalProgress(goal);
                      const isAddingMilestone = addingToGoal === `${year.id}:${goal.id}`;

                      return (
                        <article key={goal.id} className="roadmap-goal-card">
                          <header className="roadmap-goal-head">
                            <div>
                              <h3>{goal.title}</h3>
                              <span className="muted">Weight {goal.weight}</span>
                            </div>
                            <div className="goal-progress-value">{goalProgress}%</div>
                          </header>
                          {goal.description ? <p className="roadmap-goal-description">{goal.description}</p> : null}
                          <div className="progress" role="progressbar" aria-label={`${goal.title} progress`} aria-valuenow={goalProgress} aria-valuemin="0" aria-valuemax="100">
                            <div style={{ width: `${goalProgress}%` }} />
                          </div>

                          <div className="goal-milestones">
                            {(goal.milestones || []).length ? (
                              goal.milestones.map((milestone) => {
                                const milestoneProgress = getMilestoneProgress(milestone);
                                const taskCount = (milestone.tasks || []).length;

                                return (
                                  <details key={milestone.id} className="roadmap-milestone">
                                    <summary className="milestone-summary">
                                      <span className="milestone-summary-chevron" aria-hidden="true">›</span>
                                      <span className="milestone-summary-main">
                                        <strong>{milestone.name}</strong>
                                        <span className="muted">
                                          Weight {milestone.weight} · {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                                          {milestone.due_date ? ` · Due ${milestone.due_date}` : ''}
                                        </span>
                                      </span>
                                      <span className="milestone-summary-progress">{milestoneProgress}%</span>
                                    </summary>

                                    <div className="milestone-details">
                                      <label className="milestone-completion">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(milestone.completed)}
                                          onChange={(event) => toggleMilestone(year.id, goal.id, milestone.id, event.target.checked)}
                                        />
                                        <span>Mark milestone complete</span>
                                      </label>
                                      <div className="milestone-metadata">
                                        <section>
                                          <span className="eyebrow">Completion criteria</span>
                                          <p>{milestone.criteria || 'Not defined yet'}</p>
                                        </section>
                                        <section>
                                          <span className="eyebrow">Evidence</span>
                                          <p>{milestone.evidence || 'No evidence added yet'}</p>
                                        </section>
                                      </div>
                                      <div className="roadmap-tasks">
                                        {taskCount ? (
                                          milestone.tasks.map((task) => (
                                            <div key={task.id} className="roadmap-task">
                                              <div className="roadmap-task-main">
                                                <strong>{task.title}</strong>
                                                {task.description ? <div className="muted">{task.description}</div> : null}
                                                {task.due_date ? <div className="muted">Due: {task.due_date}</div> : null}
                                              </div>
                                              <div className="roadmap-task-controls">
                                                <select
                                                  aria-label={`Status for ${task.title}`}
                                                  value={task.status || 'todo'}
                                                  onChange={(event) => updateRoadmapTaskStatus(year.id, goal.id, milestone.id, task.id, event.target.value)}
                                                >
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
                                    </div>
                                  </details>
                                );
                              })
                            ) : (
                              <div className="empty">No milestones yet. Add one to break this goal into steps.</div>
                            )}
                          </div>

                          {isAddingMilestone ? (
                            <form className="add-milestone-form" onSubmit={(event) => submitMilestone(event, year.id, goal.id)}>
                              <label>
                                Milestone title
                                <input
                                  autoFocus
                                  value={milestoneName}
                                  onChange={(event) => setMilestoneName(event.target.value)}
                                  placeholder="e.g. Submit ethics application"
                                  required
                                />
                              </label>
                              <div className="dialog-actions">
                                <button type="button" className="button secondary" onClick={() => { setAddingToGoal(null); setMilestoneName(''); }}>
                                  Cancel
                                </button>
                                <button type="submit" className="button">Add milestone</button>
                              </div>
                            </form>
                          ) : (
                            <button
                              type="button"
                              className="add-milestone-button"
                              onClick={() => { setAddingToGoal(`${year.id}:${goal.id}`); setMilestoneName(''); }}
                            >
                              <span aria-hidden="true">+</span> Add milestone
                            </button>
                          )}
                        </article>
                      );
                    })
                  ) : (
                    <div className="empty">No goals yet. Add a goal to start planning this year.</div>
                  )}
                </div> : null}
              </section>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export default ProgressPage;
