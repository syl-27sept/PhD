import StatCard from '../components/StatCard';

function DashboardPage({
  papers,
  dashboardDueSoon,
  nextMeeting,
  overallProgress,
  onViewProgress,
  onViewTasks
}) {
  return (
    <section className="page">
      <div className="stats-grid">
        <StatCard label="Total papers" value={papers.length} />
        <StatCard label="Unread papers" value={papers.filter((paper) => paper.read === 'Unread').length} />
        <StatCard label="Currently reading" value={papers.filter((paper) => paper.read === 'Reading').length} />
        <StatCard label="Tasks due soon" value={dashboardDueSoon.length} />
      </div>

      <div className="grid two">
        <article className="card">
          <div className="card-head">
            <h2>PhD progress</h2>
            <span>{overallProgress}%</span>
          </div>
          <div className="progress" role="progressbar" aria-label="Overall PhD progress" aria-valuenow={overallProgress}>
            <div style={{ width: `${overallProgress}%` }} />
          </div>
          <p className="muted">Overall progress across your four-year PhD roadmap, weighted by the relative importance of goals, milestones and tasks.</p>
          <button type="button" className="button secondary" onClick={() => onViewProgress()}>
            View PhD roadmap →
          </button>
        </article>

        <article className="card">
          <div className="card-head">
            <h2>Upcoming supervisor meeting</h2>
          </div>
          {nextMeeting ? (
            <div>
              <strong>{nextMeeting.title}</strong>
              <div className="muted">{nextMeeting.date}</div>
              <div className="muted">{nextMeeting.agenda}</div>
            </div>
          ) : (
            <div className="empty">No meetings added yet.</div>
          )}
        </article>
      </div>

      <div className="grid two">
        <article className="card">
          <div className="card-head">
            <h2>Tasks due soon</h2>
            <button type="button" className="text-button" onClick={() => onViewTasks()}>View all</button>
          </div>
          <div className="list">
            {dashboardDueSoon.length ? (
              dashboardDueSoon.slice(0, 5).map((task) => (
                <div key={task.id} className="list-item">
                  <strong>{task.title}</strong>
                  <div className="muted">{task.due_date ? `Due: ${task.due_date}` : 'No due date'}</div>
                </div>
              ))
            ) : (
              <div className="empty">No outstanding tasks.</div>
            )}
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <h2>Recent activity</h2>
          </div>
          <div className="list">
            <div className="empty">Activity will appear here.</div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;
