import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import PapersPage from './pages/PapersPage';
import TasksPage from './pages/TasksPage';
import MeetingsPage from './pages/MeetingsPage';
import ProgressPage from './pages/ProgressPage';

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
      <Sidebar navItems={navItems} activeSection={activeSection} onSelect={setActiveSection} />

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">PhD · Year 1</p>
            <h1>{pageTitle}</h1>
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

        {activeSection === 'dashboard' && (
          <DashboardPage
            papers={papers}
            dashboardDueSoon={dashboardDueSoon}
            nextMeeting={nextMeeting}
            overallProgress={overallProgress}
            onViewProgress={() => setActiveSection('progress')}
            onViewTasks={() => setActiveSection('tasks')}
          />
        )}

        {activeSection === 'papers' && (
          <PapersPage
            paperSearch={paperSearch}
            paperStatus={paperStatus}
            paperStream={paperStream}
            filteredPapers={filteredPapers}
            allStreamOptions={allStreamOptions}
            onSearch={setPaperSearch}
            onStatusChange={setPaperStatus}
            onStreamChange={setPaperStream}
          />
        )}

        {activeSection === 'tasks' && (
          <TasksPage
            taskFilter={taskFilter}
            taskForm={taskForm}
            taskDialogOpen={taskDialogOpen}
            filteredTasks={filteredTasks}
            onTaskFilter={setTaskFilter}
            onTaskDialogToggle={setTaskDialogOpen}
            onTaskFormChange={(field, value) => setTaskForm((current) => ({ ...current, [field]: value }))}
            onAddTask={addTask}
            onUpdateTaskStatus={updateTaskStatus}
            onDeleteTask={deleteTask}
          />
        )}

        {activeSection === 'meetings' && (
          <MeetingsPage
            meetings={meetings}
            meetingForm={meetingForm}
            meetingDialogOpen={meetingDialogOpen}
            onMeetingDialogToggle={setMeetingDialogOpen}
            onMeetingFormChange={(field, value) => setMeetingForm((current) => ({ ...current, [field]: value }))}
            onAddMeeting={addMeeting}
          />
        )}

        {activeSection === 'progress' && (
          <ProgressPage
            roadmap={roadmap}
            overallProgress={overallProgress}
            getYearProgress={getYearProgress}
            getGoalProgress={getGoalProgress}
            getMilestoneProgress={getMilestoneProgress}
            toggleMilestone={toggleMilestone}
            updateRoadmapTaskStatus={updateRoadmapTaskStatus}
          />
        )}
      </main>
    </>
  );
}

export default App;
