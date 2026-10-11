import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEYS = {
  papers: 'silvia-phd-papers',
  tasks: 'silvia-phd-tasks',
  meetings: 'silvia-phd-meetings',
  roadmap: 'silvia-phd-roadmap'
};

const defaultRoadmap = [
  {
    id: 1,
    year: 'Year 1',
    title: 'Foundation & Exploration',
    weight: 1,
    goals: [
      {
        id: 'g101',
        title: 'Establish the research foundations',
        description: 'Define the research problem and theoretical foundations.',
        weight: 3,
        milestones: [
          {
            id: 101,
            name: 'Complete PhD induction and training',
            weight: 1,
            criteria: 'Required induction and training activities completed.',
            evidence: '',
            due_date: '',
            completed: false,
            tasks: []
          },
          {
            id: 102,
            name: 'Define research questions',
            weight: 3,
            criteria: 'Research questions documented and discussed with the supervisor.',
            evidence: '',
            due_date: '',
            completed: false,
            tasks: []
          }
        ]
      }
    ]
  },
  {
    id: 2,
    year: 'Year 2',
    title: 'Research & Data Collection',
    weight: 1,
    goals: [
      {
        id: 'g201',
        title: 'Conduct empirical research',
        description: 'Collect data and share emerging research.',
        weight: 3,
        milestones: [
          {
            id: 203,
            name: 'Begin data collection',
            weight: 2,
            criteria: 'Data collection started in accordance with the research design.',
            evidence: '',
            due_date: '',
            completed: false,
            tasks: []
          },
          {
            id: 206,
            name: 'Complete major data collection',
            weight: 3,
            criteria: 'Planned core data collection completed and documented.',
            evidence: '',
            due_date: '',
            completed: false,
            tasks: []
          }
        ]
      }
    ]
  },
  {
    id: 3,
    year: 'Year 3',
    title: 'Analysis & Writing',
    weight: 1,
    goals: [
      {
        id: 'g301',
        title: 'Analyse the research findings',
        description: 'Turn research data into defensible findings.',
        weight: 3,
        milestones: [
          {
            id: 302,
            name: 'Analyse research data',
            weight: 3,
            criteria: 'Analysis completed using the justified methodology.',
            evidence: '',
            due_date: '',
            completed: false,
            tasks: []
          }
        ]
      }
    ]
  },
  {
    id: 4,
    year: 'Year 4',
    title: 'Thesis Completion & Submission',
    weight: 1,
    goals: [
      {
        id: 'g401',
        title: 'Complete the thesis',
        description: 'Integrate the research into a complete doctoral thesis.',
        weight: 3,
        milestones: [
          {
            id: 402,
            name: 'Complete full thesis draft',
            weight: 3,
            criteria: 'Complete thesis draft assembled.',
            evidence: '',
            due_date: '',
            completed: false,
            tasks: []
          }
        ]
      }
    ]
  }
];

const defaultTasks = [
  { id: 't-1', title: 'Draft introduction', description: 'Write the research context section', due_date: '2026-10-14', status: 'in_progress' },
  { id: 't-2', title: 'Review methodology paper', description: 'Collect 3 recent papers for design review', due_date: '2026-10-18', status: 'todo' },
  { id: 't-3', title: 'Supervisor check-in', description: 'Prepare questions for next meeting', due_date: '2026-10-22', status: 'todo' }
];

const defaultMeetings = [
  { id: 'm-1', title: 'Research supervision check-in', date: '2026-10-18', agenda: 'Discuss methodology and chapter outline' },
  { id: 'm-2', title: 'Progress review', date: '2026-11-02', agenda: 'Review literature and next milestones' }
];

const defaultPapers = [
  { author: 'Author A', year: 2024, title: 'Understanding mixed-method doctoral research', journal: 'Journal of Research Practice', link: '#', stream: 'Research methods', read: 'Unread' },
  { author: 'Author B', year: 2023, title: 'Qualitative evidence synthesis in practice', journal: 'Educational Review', link: '#', stream: 'Literature review', read: 'Reading' },
  { author: 'Author C', year: 2022, title: 'The role of supervision in research design', journal: 'Higher Education Studies', link: '#', stream: 'Supervision', read: 'Read' }
];

const readStatusOptions = ['Unread', 'Reading', 'Read'];

function getStoredValue(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function getTaskProgress(status) {
  switch (status) {
    case 'done':
      return 100;
    case 'in_progress':
      return 50;
    default:
      return 0;
  }
}

function getMilestoneProgress(milestone) {
  if (!milestone.tasks?.length) return milestone.completed ? 100 : 0;

  const totalWeight = milestone.tasks.reduce((sum, task) => sum + Number(task.weight || 1), 0);
  const weightedProgress = milestone.tasks.reduce((sum, task) => {
    const taskWeight = Number(task.weight || 1);
    return sum + taskWeight * getTaskProgress(task.status || 'todo');
  }, 0);

  return Math.round((weightedProgress / totalWeight) * 100);
}

function getGoalProgress(goal) {
  if (!goal.milestones?.length) return 0;

  const totalWeight = goal.milestones.reduce((sum, milestone) => sum + Number(milestone.weight || 1), 0);
  const weightedProgress = goal.milestones.reduce((sum, milestone) => {
    const weight = Number(milestone.weight || 1);
    return sum + weight * getMilestoneProgress(milestone);
  }, 0);

  return Math.round((weightedProgress / totalWeight) * 100);
}

function getYearProgress(year) {
  if (!year.goals?.length) return 0;

  const totalWeight = year.goals.reduce((sum, goal) => sum + Number(goal.weight || 1), 0);
  const weightedProgress = year.goals.reduce((sum, goal) => {
    const weight = Number(goal.weight || 1);
    return sum + weight * getGoalProgress(goal);
  }, 0);

  return Math.round((weightedProgress / totalWeight) * 100);
}

function getOverallProgress(roadmap) {
  if (!roadmap.length) return 0;

  const totalWeight = roadmap.reduce((sum, year) => sum + Number(year.weight || 1), 0);
  const weightedProgress = roadmap.reduce((sum, year) => {
    const weight = Number(year.weight || 1);
    return sum + weight * getYearProgress(year);
  }, 0);

  return Math.round((weightedProgress / totalWeight) * 100);
}

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [tasks, setTasks] = useState(() => getStoredValue(STORAGE_KEYS.tasks, defaultTasks));
  const [meetings, setMeetings] = useState(() => getStoredValue(STORAGE_KEYS.meetings, defaultMeetings));
  const [papers, setPapers] = useState(() => getStoredValue(STORAGE_KEYS.papers, defaultPapers));
  const [roadmap, setRoadmap] = useState(() => getStoredValue(STORAGE_KEYS.roadmap, defaultRoadmap));
  const [taskFilter, setTaskFilter] = useState('all');
  const [paperSearch, setPaperSearch] = useState('');
  const [paperStatus, setPaperStatus] = useState('');
  const [paperStream, setPaperStream] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '', status: 'todo' });
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', agenda: '' });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.meetings, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.papers, JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.roadmap, JSON.stringify(roadmap));
  }, [roadmap]);

  const allStreamOptions = useMemo(() => {
    const streams = papers.map((paper) => paper.stream).filter(Boolean);
    return [...new Set(streams)].sort();
  }, [papers]);

  const overallProgress = useMemo(() => getOverallProgress(roadmap), [roadmap]);

  const filteredPapers = useMemo(() => {
    const query = paperSearch.toLowerCase();
    return papers.filter((paper) => {
      const searchable = [paper.author, paper.year, paper.title, paper.journal, paper.stream, paper.read]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query) && (!paperStatus || paper.read === paperStatus) && (!paperStream || paper.stream === paperStream);
    });
  }, [paperSearch, paperStatus, paperStream, papers]);

  const dashboardDueSoon = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return tasks.filter((task) => {
      if (!task.due_date || task.status === 'done') return false;
      const due = new Date(`${task.due_date}T12:00:00`);
      return due >= today && due <= nextWeek;
    });
  }, [tasks]);

  const nextMeeting = useMemo(() => {
    const now = new Date();
    return [...meetings].sort((a, b) => new Date(a.date) - new Date(b.date)).find((meeting) => new Date(meeting.date) >= now) || null;
  }, [meetings]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (taskFilter === 'all') return true;
      return task.status === taskFilter;
    });
  }, [taskFilter, tasks]);

  const addTask = (event) => {
    event.preventDefault();
    if (!taskForm.title.trim()) return;

    const item = {
      id: `task-${Date.now()}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      due_date: taskForm.due_date || '',
      status: taskForm.status
    };

    setTasks((current) => [item, ...current]);
    setTaskForm({ title: '', description: '', due_date: '', status: 'todo' });
    setTaskDialogOpen(false);
  };

  const addMeeting = (event) => {
    event.preventDefault();
    if (!meetingForm.title.trim() || !meetingForm.date) return;

    setMeetings((current) => [
      ...current,
      {
        id: `meeting-${Date.now()}`,
        title: meetingForm.title.trim(),
        date: meetingForm.date,
        agenda: meetingForm.agenda.trim()
      }
    ]);

    setMeetingForm({ title: '', date: '', agenda: '' });
    setMeetingDialogOpen(false);
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  const deleteTask = (taskId) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  const toggleMilestone = (yearId, goalId, milestoneId, checked) => {
    setRoadmap((current) => current.map((year) => {
      if (year.id !== yearId) return year;

      return {
        ...year,
        goals: year.goals.map((goal) => {
          if (goal.id !== goalId) return goal;
          return {
            ...goal,
            milestones: goal.milestones.map((milestone) =>
              milestone.id === milestoneId ? { ...milestone, completed: checked } : milestone
            )
          };
        })
      };
    }));
  };

  const updateRoadmapTaskStatus = (yearId, goalId, milestoneId, taskId, status) => {
    setRoadmap((current) => current.map((year) => {
      if (year.id !== yearId) return year;
      return {
        ...year,
        goals: year.goals.map((goal) => {
          if (goal.id !== goalId) return goal;
          return {
            ...goal,
            milestones: goal.milestones.map((milestone) => {
              if (milestone.id !== milestoneId) return milestone;
              return {
                ...milestone,
                tasks: milestone.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
                completed: status === 'done'
              };
            })
          };
        })
      };
    }));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'papers', label: 'Papers' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'meetings', label: 'Supervisor Meetings' },
    { id: 'progress', label: 'Progress' }
  ];

  const pageTitle = navItems.find((item) => item.id === activeSection)?.label || 'Dashboard';

  return (
    <>
      <aside className="sidebar">
        <div className="brand">Silvia PhD</div>
        <nav aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">PhD · Year 1</p>
            <h1 id="page-title">{pageTitle}</h1>
          </div>
          <div className="actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setActiveSection('tasks');
                setTaskDialogOpen(true);
              }}
            >
              + Add Task
            </button>
          </div>
        </header>

        <section className={`page ${activeSection === 'dashboard' ? '' : 'hidden'}`}>
          <div className="stats-grid">
            <article className="stat">
              <span>Total papers</span>
              <strong>{papers.length}</strong>
            </article>
            <article className="stat">
              <span>Unread papers</span>
              <strong>{papers.filter((paper) => paper.read === 'Unread').length}</strong>
            </article>
            <article className="stat">
              <span>Currently reading</span>
              <strong>{papers.filter((paper) => paper.read === 'Reading').length}</strong>
            </article>
            <article className="stat">
              <span>Tasks due soon</span>
              <strong>{dashboardDueSoon.length}</strong>
            </article>
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
              <button type="button" className="button secondary" onClick={() => setActiveSection('progress')}>View PhD roadmap →</button>
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
                <button type="button" className="text-button" onClick={() => setActiveSection('tasks')}>View all</button>
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

        <section className={`page ${activeSection === 'papers' ? '' : 'hidden'}`}>
          <div className="section-tools">
            <input type="search" value={paperSearch} onChange={(event) => setPaperSearch(event.target.value)} placeholder="Search papers..." aria-label="Search papers" />
            <select value={paperStatus} onChange={(event) => setPaperStatus(event.target.value)} aria-label="Filter papers by status">
              <option value="">All statuses</option>
              {readStatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select value={paperStream} onChange={(event) => setPaperStream(event.target.value)} aria-label="Filter by literature stream">
              <option value="">All literature streams</option>
              {allStreamOptions.map((stream) => (
                <option key={stream} value={stream}>{stream}</option>
              ))}
            </select>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Papers</h2>
              <a href="https://docs.google.com" target="_blank" rel="noreferrer">Open Google Sheet ↗</a>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Author(s)</th>
                    <th>Year</th>
                    <th>Title</th>
                    <th>Journal/Book</th>
                    <th>Literature stream</th>
                    <th>Read?</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPapers.length ? (
                    filteredPapers.map((paper, index) => (
                      <tr key={`${paper.title}-${index}`}>
                        <td>{paper.author}</td>
                        <td>{paper.year}</td>
                        <td>
                          {paper.link && paper.link !== '#' ? (
                            <a href={paper.link} target="_blank" rel="noreferrer">{paper.title}</a>
                          ) : (
                            paper.title
                          )}
                        </td>
                        <td>{paper.journal}</td>
                        <td>{paper.stream}</td>
                        <td>{paper.read}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty">No papers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={`page ${activeSection === 'tasks' ? '' : 'hidden'}`}>
          <div className="card">
            <div className="card-head">
              <h2>Tasks</h2>
              <button type="button" className="button" onClick={() => setTaskDialogOpen((current) => !current)}>
                + Add Task
              </button>
            </div>

            {taskDialogOpen && (
              <form className="task-form" onSubmit={addTask}>
                <input type="text" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} placeholder="Task name" required />
                <textarea value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} placeholder="Description" rows="3" />
                <div className="form-row">
                  <input type="date" value={taskForm.due_date} onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })} />
                  <select value={taskForm.status} onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}>
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="dialog-actions">
                  <button type="button" className="button secondary" onClick={() => setTaskDialogOpen(false)}>Cancel</button>
                  <button type="submit" className="button">Save task</button>
                </div>
              </form>
            )}

            <div className="section-tools">
              <select value={taskFilter} onChange={(event) => setTaskFilter(event.target.value)} aria-label="Filter tasks">
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
                      <select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value)}>
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button type="button" className="button secondary" onClick={() => deleteTask(task.id)}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">No tasks yet.</div>
              )}
            </div>
          </div>
        </section>

        <section className={`page ${activeSection === 'meetings' ? '' : 'hidden'}`}>
          <div className="card">
            <div className="card-head">
              <h2>Supervisor Meetings</h2>
              <button type="button" className="button" onClick={() => setMeetingDialogOpen((current) => !current)}>
                + Add Meeting
              </button>
            </div>

            {meetingDialogOpen && (
              <form className="task-form" onSubmit={addMeeting}>
                <input type="text" value={meetingForm.title} onChange={(event) => setMeetingForm({ ...meetingForm, title: event.target.value })} placeholder="Meeting title" required />
                <input type="date" value={meetingForm.date} onChange={(event) => setMeetingForm({ ...meetingForm, date: event.target.value })} required />
                <textarea value={meetingForm.agenda} onChange={(event) => setMeetingForm({ ...meetingForm, agenda: event.target.value })} placeholder="Agenda" rows="3" />
                <div className="dialog-actions">
                  <button type="button" className="button secondary" onClick={() => setMeetingDialogOpen(false)}>Cancel</button>
                  <button type="submit" className="button">Save meeting</button>
                </div>
              </form>
            )}

            <div className="list">
              {meetings.length ? (
                [...meetings].sort((a, b) => new Date(a.date) - new Date(b.date)).map((meeting) => (
                  <div key={meeting.id} className="list-item">
                    <strong>{meeting.title}</strong>
                    <div className="muted">{meeting.date}</div>
                    {meeting.agenda ? <div className="muted">{meeting.agenda}</div> : null}
                  </div>
                ))
              ) : (
                <div className="empty">No meetings yet.</div>
              )}
            </div>
          </div>
        </section>

        <section className={`page ${activeSection === 'progress' ? '' : 'hidden'}`}>
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
      </main>
    </>
  );
}

export default App;
