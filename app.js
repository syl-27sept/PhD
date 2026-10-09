
const GOOGLE_SHEETS_API =
  "https://script.google.com/macros/s/AKfycbzrX9ILnV2CAUEywzkYn4iNASyx9XGfwbVSjg1CYuq9ennyf2XcbO9_j1Uc0gJDDumPZA/exec";

const SUPABASE_TASKS_API =
  "https://ouspoawbetddlhojskxz.supabase.co/functions/v1/tasks";

const ROADMAP_KEY = "silvia-phd-roadmap";
const MEETINGS_KEY = "silvia-phd-meetings";

/* =====================================================
   HELPERS
===================================================== */

function $(id) {
  return document.getElementById(id);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function validWeight(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function makeId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key}:`, error);
    return fallback;
  }
}

/* =====================================================
   DEFAULT ROADMAP
===================================================== */

function createDefaultRoadmap() {
  return [
    {
      id: 1,
      year: "Year 1",
      title: "Foundation & Exploration",
      weight: 1,
      goals: [
        {
          id: "g101",
          title: "Establish the research foundations",
          description: "Define the research problem and theoretical foundations.",
          weight: 3,
          milestones: [
            {
              id: 101,
              name: "Complete PhD induction and training",
              weight: 1,
              criteria: "Required induction and training activities completed.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 102,
              name: "Define research questions",
              weight: 3,
              criteria: "Research questions documented and discussed with the supervisor.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 104,
              name: "Establish literature streams",
              weight: 2,
              criteria: "Literature streams and boundaries documented.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        },
        {
          id: "g102",
          title: "Develop the research design",
          description: "Build the literature review and research methodology.",
          weight: 3,
          milestones: [
            {
              id: 103,
              name: "Complete initial literature review",
              weight: 3,
              criteria: "Initial literature review documented and critically synthesised.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 105,
              name: "Develop research methodology",
              weight: 3,
              criteria: "Research design and methodological choices justified.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 106,
              name: "Prepare first-year review",
              weight: 2,
              criteria: "First-year review prepared and submitted as required.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        }
      ]
    },
    {
      id: 2,
      year: "Year 2",
      title: "Research & Data Collection",
      weight: 1,
      goals: [
        {
          id: "g201",
          title: "Finalise the research design",
          description: "Prepare the study for data collection.",
          weight: 2,
          milestones: [
            {
              id: 201,
              name: "Finalise research design",
              weight: 3,
              criteria: "Research design documented and validated.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 202,
              name: "Complete ethics approval",
              weight: 3,
              criteria: "Required ethics approval obtained, where applicable.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 204,
              name: "Continue literature review",
              weight: 2,
              criteria: "Relevant literature reviewed and integrated into the research.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        },
        {
          id: "g202",
          title: "Conduct empirical research",
          description: "Collect data and share emerging research.",
          weight: 3,
          milestones: [
            {
              id: 203,
              name: "Begin data collection",
              weight: 2,
              criteria: "Data collection started in accordance with the research design.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 205,
              name: "Present research at a conference",
              weight: 1,
              criteria: "Research presented at an appropriate conference.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 206,
              name: "Complete major data collection",
              weight: 3,
              criteria: "Planned core data collection completed and documented.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        }
      ]
    },
    {
      id: 3,
      year: "Year 3",
      title: "Analysis & Writing",
      weight: 1,
      goals: [
        {
          id: "g301",
          title: "Analyse the research findings",
          description: "Turn research data into defensible findings.",
          weight: 3,
          milestones: [
            {
              id: 301,
              name: "Complete data collection",
              weight: 2,
              criteria: "Remaining planned data collection completed.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 302,
              name: "Analyse research data",
              weight: 3,
              criteria: "Analysis completed using the justified methodology.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 303,
              name: "Develop findings",
              weight: 3,
              criteria: "Findings documented and connected to research questions.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        },
        {
          id: "g302",
          title: "Develop research outputs",
          description: "Write the thesis and communicate findings.",
          weight: 2,
          milestones: [
            {
              id: 304,
              name: "Draft thesis chapters",
              weight: 3,
              criteria: "Planned thesis chapters drafted.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 305,
              name: "Submit papers for publication",
              weight: 2,
              criteria: "Target manuscripts submitted where appropriate.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 306,
              name: "Present research at conferences",
              weight: 1,
              criteria: "Research presented at relevant academic conferences.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        }
      ]
    },
    {
      id: 4,
      year: "Year 4",
      title: "Thesis Completion & Submission",
      weight: 1,
      goals: [
        {
          id: "g401",
          title: "Complete the thesis",
          description: "Integrate the research into a complete doctoral thesis.",
          weight: 3,
          milestones: [
            {
              id: 401,
              name: "Complete remaining thesis chapters",
              weight: 2,
              criteria: "Remaining chapters completed.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 402,
              name: "Complete full thesis draft",
              weight: 3,
              criteria: "Complete thesis draft assembled.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 403,
              name: "Supervisor review and revisions",
              weight: 2,
              criteria: "Feedback considered and revisions completed.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        },
        {
          id: "g402",
          title: "Submit and defend the thesis",
          description: "Complete formal submission and viva preparation.",
          weight: 3,
          milestones: [
            {
              id: 404,
              name: "Finalise thesis",
              weight: 3,
              criteria: "Final thesis meets institutional requirements.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 405,
              name: "Submit PhD thesis",
              weight: 3,
              criteria: "Formal thesis submission confirmed.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            },
            {
              id: 406,
              name: "Prepare for viva",
              weight: 2,
              criteria: "Viva preparation completed.",
              evidence: "",
              due_date: "",
              completed: false,
              tasks: []
            }
          ]
        }
      ]
    }
  ];
}

/* =====================================================
   MIGRATION AND APPLICATION STATE
===================================================== */

function normaliseTask(task) {
  return {
    id: task.id ?? makeId("task"),
    title: task.title || task.name || "Untitled task",
    description: task.description || "",
    weight: validWeight(task.weight, 1),
    status: ["todo", "in_progress", "done"].includes(task.status)
      ? task.status
      : (task.completed ? "done" : "todo"),
    due_date: task.due_date || "",
    evidence: task.evidence || ""
  };
}

function normaliseMilestone(milestone) {
  return {
    id: milestone.id ?? makeId("milestone"),
    name: milestone.name || "Untitled milestone",
    weight: validWeight(milestone.weight, 1),
    criteria: milestone.criteria || "",
    evidence: milestone.evidence || "",
    due_date: milestone.due_date || "",
    completed: Boolean(milestone.completed),
    tasks: Array.isArray(milestone.tasks)
      ? milestone.tasks.map(normaliseTask)
      : []
  };
}

function migrateRoadmap(roadmap) {
  if (!Array.isArray(roadmap)) return createDefaultRoadmap();

  return roadmap.map((year, index) => {
    const goals = Array.isArray(year.goals)
      ? year.goals
      : [{
          id: `g-migrated-${year.id ?? index + 1}`,
          title: year.title || `Goals for ${year.year || "this year"}`,
          description: "",
          weight: 1,
          milestones: Array.isArray(year.milestones) ? year.milestones : []
        }];

    return {
      id: year.id ?? index + 1,
      year: year.year || `Year ${index + 1}`,
      title: year.title || "",
      weight: validWeight(year.weight, 1),
      goals: goals.map((goal, goalIndex) => ({
        id: goal.id ?? makeId(`goal${goalIndex + 1}`),
        title: goal.title || "Untitled goal",
        description: goal.description || "",
        weight: validWeight(goal.weight, 1),
        milestones: Array.isArray(goal.milestones)
          ? goal.milestones.map(normaliseMilestone)
          : []
      }))
    };
  });
}

function loadRoadmap() {
  const saved = readStorage(ROADMAP_KEY, null);
  const roadmap = Array.isArray(saved)
    ? migrateRoadmap(saved)
    : createDefaultRoadmap();

  localStorage.setItem(ROADMAP_KEY, JSON.stringify(roadmap));
  return roadmap;
}

const state = {
  papers: [],
  tasks: [],
  meetings: readStorage(MEETINGS_KEY, []),
  roadmap: loadRoadmap()
};

/* =====================================================
   PAPERS — GOOGLE SHEETS
===================================================== */

async function loadPapers() {
  try {
    const response = await fetch(GOOGLE_SHEETS_API);
    if (!response.ok) throw new Error("Google Sheets request failed");

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected Google Sheets response");

    state.papers = data.map(row => ({
      author: row["Author(s)"] ?? "",
      year: row["Year"] ?? "",
      title: row["Title"] ?? "",
      journal: row["Journal/Book"] ?? "",
      link: row["DOI/Link"] ?? "",
      stream: row["Literature stream"] ?? "",
      subtopic: row["Sub-topic"] ?? "",
      read: normalizeReadStatus(row["Read?"])
    }));

    populateStreams();
    renderPapers();
  } catch (error) {
    console.error("Paper loading error:", error);
    if ($("papers-table")) {
      $("papers-table").innerHTML =
        `<tr><td colspan="6" class="empty">Could not load the Google Sheet.</td></tr>`;
    }
  }
}

function normalizeReadStatus(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (text === "read") return "Read";
  if (text === "reading") return "Reading";
  return "Unread";
}

function populateStreams() {
  const select = $("paper-stream");
  if (!select) return;

  const streams = [...new Set(
    state.papers.map(paper => paper.stream).filter(Boolean)
  )].sort();

  select.innerHTML =
    '<option value="">All literature streams</option>' +
    streams.map(stream =>
      `<option value="${esc(stream)}">${esc(stream)}</option>`
    ).join("");
}

function renderPapers() {
  const query = ($("paper-search")?.value || "").toLowerCase();
  const status = $("paper-status")?.value || "";
  const stream = $("paper-stream")?.value || "";

  const rows = state.papers.filter(paper =>
    Object.values(paper).join(" ").toLowerCase().includes(query) &&
    (!status || paper.read === status) &&
    (!stream || paper.stream === stream)
  );

  const table = $("papers-table");
  if (!table) return;

  table.innerHTML = rows.length
    ? rows.map(paper => `
        <tr>
          <td>${esc(paper.author)}</td>
          <td>${esc(paper.year)}</td>
          <td>${paper.link
            ? `<a href="${esc(paper.link)}" target="_blank" rel="noopener">${esc(paper.title)}</a>`
            : esc(paper.title)}</td>
          <td>${esc(paper.journal)}</td>
          <td>${esc(paper.stream)}</td>
          <td>${esc(paper.read)}</td>
        </tr>`).join("")
    : `<tr><td colspan="6" class="empty">No papers found.</td></tr>`;

  if ($("total-papers")) $("total-papers").textContent = state.papers.length;
  if ($("unread-papers")) {
    $("unread-papers").textContent =
      state.papers.filter(paper => paper.read === "Unread").length;
  }
  if ($("reading-papers")) {
    $("reading-papers").textContent =
      state.papers.filter(paper => paper.read === "Reading").length;
  }
}

/* =====================================================
   GENERAL TASKS — SUPABASE
===================================================== */

async function loadTasks() {
  try {
    const response = await fetch(SUPABASE_TASKS_API);
    if (!response.ok) throw new Error("Could not load tasks");

    state.tasks = await response.json();
    renderTasks();
    updateDashboard();
  } catch (error) {
    console.error("Task loading error:", error);
    if ($("tasks-list")) {
      $("tasks-list").innerHTML =
        `<div class="empty">Could not load tasks from Supabase.</div>`;
    }
  }
}

async function createTask(task) {
  try {
    const response = await fetch(SUPABASE_TASKS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Could not create task");
    }

    const createdTask = await response.json();
    state.tasks.push(createdTask);
    renderTasks();
    updateDashboard();
    return createdTask;
  } catch (error) {
    console.error("Create task error:", error);
    alert("Could not save the task.");
    return null;
  }
}

async function updateTask(taskId, updates) {
  try {
    const response = await fetch(SUPABASE_TASKS_API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, ...updates })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Could not update task");
    }

    const updatedTask = await response.json();
    const index = state.tasks.findIndex(task => String(task.id) === String(taskId));

    if (index !== -1) state.tasks[index] = updatedTask;
    renderTasks();
    updateDashboard();
  } catch (error) {
    console.error("Update task error:", error);
    alert("Could not update the task.");
  }
}

async function deleteTask(taskId) {
  if (!confirm("Delete this task?")) return;

  try {
    const response = await fetch(SUPABASE_TASKS_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Could not delete task");
    }

    state.tasks = state.tasks.filter(task => String(task.id) !== String(taskId));
    renderTasks();
    updateDashboard();
  } catch (error) {
    console.error("Delete task error:", error);
    alert("Could not delete the task.");
  }
}

function renderTasks() {
  const list = $("tasks-list");
  if (!list) return;

  list.innerHTML = state.tasks.length
    ? state.tasks.map(task => {
        const status = task.status || "todo";
        return `
          <div class="list-item">
            <strong>${esc(task.title)}</strong>
            ${task.description ? `<div class="muted">${esc(task.description)}</div>` : ""}
            <div class="muted">${task.due_date ? `Due: ${esc(task.due_date)}` : "No due date"}</div>
            <div class="task-actions">
              <select onchange="changeTaskStatus('${esc(task.id)}',this.value)">
                <option value="todo" ${status === "todo" ? "selected" : ""}>To do</option>
                <option value="in_progress" ${status === "in_progress" ? "selected" : ""}>In progress</option>
                <option value="done" ${status === "done" ? "selected" : ""}>Done</option>
              </select>
              <button class="button secondary" onclick="editTask('${esc(task.id)}')">Edit</button>
              <button class="button secondary" onclick="deleteTask('${esc(task.id)}')">Delete</button>
            </div>
          </div>`;
      }).join("")
    : `<div class="empty">No tasks yet.</div>`;

  renderDashboardTasks();
}

function renderDashboardTasks() {
  const dashboard = $("dashboard-tasks");
  if (!dashboard) return;

  const unfinished = state.tasks
    .filter(task => (task.status || "todo") !== "done")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    })
    .slice(0, 5);

  dashboard.innerHTML = unfinished.length
    ? unfinished.map(task => `
        <div class="list-item">
          <strong>${esc(task.title)}</strong>
          <div class="muted">${task.due_date ? `Due: ${esc(task.due_date)}` : "No due date"}</div>
        </div>`).join("")
    : `<div class="empty">No outstanding tasks.</div>`;
}

async function changeTaskStatus(taskId, status) {
  await updateTask(taskId, { status });
}

async function editTask(taskId) {
  const task = state.tasks.find(item => String(item.id) === String(taskId));
  if (!task) return;

  const title = prompt("Task title:", task.title || "");
  if (title === null) return;
  const description = prompt("Description:", task.description || "");
  if (description === null) return;
  const dueDate = prompt("Due date (YYYY-MM-DD), or blank:", task.due_date || "");
  if (dueDate === null) return;

  await updateTask(taskId, {
    title: title.trim(),
    description: description.trim() || null,
    due_date: dueDate.trim() || null
  });
}

function addTask() {
  $("task-dialog")?.showModal();
}

$("task-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));

  const created = await createTask({
    title: data.name?.trim() || "Untitled task",
    description: data.description?.trim() || null,
    due_date: data.due_date || null,
    status: "todo"
  });

  if (created) {
    event.target.reset();
    $("task-dialog")?.close();
  }
});

$("add-task")?.addEventListener("click", addTask);
$("add-task-2")?.addEventListener("click", addTask);

/* =====================================================
   SUPERVISOR MEETINGS — LOCAL STORAGE
===================================================== */

function saveMeetings() {
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(state.meetings));
}

function renderMeetings() {
  const list = $("meetings-list");
  const sorted = [...state.meetings].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  if (list) {
    list.innerHTML = sorted.length
      ? sorted.map(meeting => `
          <div class="list-item">
            <strong>${esc(meeting.title || "Supervisor meeting")}</strong>
            <div class="muted">${esc(meeting.date || "")}</div>
            <div>${esc(meeting.notes || "")}</div>
          </div>`).join("")
      : `<div class="empty">No meetings yet.</div>`;
  }

  const next = sorted.find(meeting =>
    meeting.date && new Date(meeting.date) >= new Date()
  );

  if ($("next-meeting")) {
    $("next-meeting").innerHTML = next
      ? `<strong>${esc(next.title || "Supervisor meeting")}</strong>
         <div class="muted">${esc(next.date)}</div>`
      : "No upcoming meeting.";
  }
}

$("add-meeting")?.addEventListener("click", () => {
  const title = prompt("Meeting title:", "Supervisor meeting");
  if (title === null) return;

  const date = prompt("Date and time (YYYY-MM-DD):", "");
  if (date === null) return;

  const notes = prompt("Notes:", "");
  if (notes === null) return;

  state.meetings.push({
    id: makeId("meeting"),
    title: title.trim(),
    date: date.trim(),
    notes: notes.trim()
  });

  saveMeetings();
  renderMeetings();
});

/* =====================================================
   WEIGHTED PROGRESS CALCULATIONS
===================================================== */

function weightedAverage(items, getWeight, getProgress) {
  if (!items.length) return 0;

  const totalWeight = items.reduce(
    (sum, item) => sum + validWeight(getWeight(item), 1),
    0
  );

  if (!totalWeight) return 0;

  const total = items.reduce(
    (sum, item) =>
      sum + validWeight(getWeight(item), 1) * getProgress(item),
    0
  );

  return Math.round(total / totalWeight);
}

function getTaskProgress(task) {
  if (task.status === "done") return 100;
  if (task.status === "in_progress") return 50;
  return 0;
}

function getMilestoneProgress(milestone) {
  if (milestone.completed) return 100;

  return weightedAverage(
    milestone.tasks,
    task => task.weight,
    getTaskProgress
  );
}

function getGoalProgress(goal) {
  return weightedAverage(
    goal.milestones,
    milestone => milestone.weight,
    getMilestoneProgress
  );
}

function getYearProgress(year) {
  return weightedAverage(
    year.goals,
    goal => goal.weight,
    getGoalProgress
  );
}

function getOverallProgress() {
  return weightedAverage(
    state.roadmap,
    year => year.weight,
    getYearProgress
  );
}

/* =====================================================
   ROADMAP SAVE AND LOOKUPS
===================================================== */

function saveRoadmap() {
  localStorage.setItem(ROADMAP_KEY, JSON.stringify(state.roadmap));
  renderRoadmap();
  updateDashboard();
}

function findYear(yearId) {
  return state.roadmap.find(year => String(year.id) === String(yearId));
}

function findGoal(yearId, goalId) {
  return findYear(yearId)?.goals.find(goal => String(goal.id) === String(goalId));
}

function findMilestone(yearId, goalId, milestoneId) {
  return findGoal(yearId, goalId)?.milestones.find(
    milestone => String(milestone.id) === String(milestoneId)
  );
}

function findRoadmapTask(yearId, goalId, milestoneId, taskId) {
  return findMilestone(yearId, goalId, milestoneId)?.tasks.find(
    task => String(task.id) === String(taskId)
  );
}

/* =====================================================
   GOAL MANAGEMENT
===================================================== */

function addGoal(yearId) {
  const year = findYear(yearId);
  if (!year) return;

  const title = prompt("Goal title:");
  if (!title?.trim()) return;

  const description = prompt("Goal description:", "");
  if (description === null) return;

  const weight = prompt("Importance weight:", "1");
  if (weight === null) return;

  year.goals.push({
    id: makeId("goal"),
    title: title.trim(),
    description: description.trim(),
    weight: validWeight(weight),
    milestones: []
  });

  saveRoadmap();
}

function editGoal(yearId, goalId) {
  const goal = findGoal(yearId, goalId);
  if (!goal) return;

  const title = prompt("Goal title:", goal.title);
  if (title === null || !title.trim()) return;

  const description = prompt("Description:", goal.description || "");
  if (description === null) return;

  const weight = prompt("Importance weight:", String(goal.weight));
  if (weight === null) return;

  goal.title = title.trim();
  goal.description = description.trim();
  goal.weight = validWeight(weight, goal.weight);
  saveRoadmap();
}

function deleteGoal(yearId, goalId) {
  const year = findYear(yearId);
  const goal = findGoal(yearId, goalId);
  if (!year || !goal) return;

  if (!confirm(`Delete "${goal.title}" and all its milestones and tasks?`)) return;

  year.goals = year.goals.filter(item => String(item.id) !== String(goalId));
  saveRoadmap();
}

/* =====================================================
   MILESTONE MANAGEMENT
===================================================== */

function addMilestone(yearId, goalId) {
  const goal = findGoal(yearId, goalId);
  if (!goal) return;

  const name = prompt("Milestone name:");
  if (!name?.trim()) return;

  const criteria = prompt("Completion criteria:", "");
  if (criteria === null) return;

  const evidence = prompt("Evidence URL or reference:", "");
  if (evidence === null) return;

  const dueDate = prompt("Due date (YYYY-MM-DD), or blank:", "");
  if (dueDate === null) return;

  const weight = prompt("Importance weight:", "1");
  if (weight === null) return;

  goal.milestones.push({
    id: makeId("milestone"),
    name: name.trim(),
    weight: validWeight(weight),
    criteria: criteria.trim(),
    evidence: evidence.trim(),
    due_date: dueDate.trim(),
    completed: false,
    tasks: []
  });

  saveRoadmap();
}

function editMilestone(yearId, goalId, milestoneId) {
  const milestone = findMilestone(yearId, goalId, milestoneId);
  if (!milestone) return;

  const name = prompt("Milestone name:", milestone.name);
  if (name === null || !name.trim()) return;

  const criteria = prompt("Completion criteria:", milestone.criteria || "");
  if (criteria === null) return;

  const evidence = prompt("Evidence URL or reference:", milestone.evidence || "");
  if (evidence === null) return;

  const dueDate = prompt("Due date (YYYY-MM-DD), or blank:", milestone.due_date || "");
  if (dueDate === null) return;

  const weight = prompt("Importance weight:", String(milestone.weight));
  if (weight === null) return;

  milestone.name = name.trim();
  milestone.criteria = criteria.trim();
  milestone.evidence = evidence.trim();
  milestone.due_date = dueDate.trim();
  milestone.weight = validWeight(weight, milestone.weight);

  saveRoadmap();
}

function deleteMilestone(yearId, goalId, milestoneId) {
  const goal = findGoal(yearId, goalId);
  const milestone = findMilestone(yearId, goalId, milestoneId);
  if (!goal || !milestone) return;

  if (!confirm(`Delete "${milestone.name}" and its tasks?`)) return;

  goal.milestones = goal.milestones.filter(
    item => String(item.id) !== String(milestoneId)
  );

  saveRoadmap();
}

/* =====================================================
   ROADMAP TASK MANAGEMENT
===================================================== */

function addRoadmapTask(yearId, goalId, milestoneId) {
  const milestone = findMilestone(yearId, goalId, milestoneId);
  if (!milestone) return;

  const title = prompt("Task title:");
  if (!title?.trim()) return;

  const description = prompt("Task description:", "");
  if (description === null) return;

  const dueDate = prompt("Due date (YYYY-MM-DD), or blank:", "");
  if (dueDate === null) return;

  const weight = prompt("Task importance weight:", "1");
  if (weight === null) return;

  milestone.tasks.push({
    id: makeId("task"),
    title: title.trim(),
    description: description.trim(),
    weight: validWeight(weight),
    status: "todo",
    due_date: dueDate.trim(),
    evidence: ""
  });

  milestone.completed = false;
  saveRoadmap();
}

function editRoadmapTask(yearId, goalId, milestoneId, taskId) {
  const task = findRoadmapTask(yearId, goalId, milestoneId, taskId);
  if (!task) return;

  const title = prompt("Task title:", task.title);
  if (title === null || !title.trim()) return;

  const description = prompt("Description:", task.description || "");
  if (description === null) return;

  const dueDate = prompt("Due date (YYYY-MM-DD), or blank:", task.due_date || "");
  if (dueDate === null) return;

  const weight = prompt("Importance weight:", String(task.weight));
  if (weight === null) return;

  task.title = title.trim();
  task.description = description.trim();
  task.due_date = dueDate.trim();
  task.weight = validWeight(weight, task.weight);

  saveRoadmap();
}

function deleteRoadmapTask(yearId, goalId, milestoneId, taskId) {
  const milestone = findMilestone(yearId, goalId, milestoneId);
  const task = findRoadmapTask(yearId, goalId, milestoneId, taskId);
  if (!milestone || !task) return;

  if (!confirm(`Delete task "${task.title}"?`)) return;

  milestone.tasks = milestone.tasks.filter(
    item => String(item.id) !== String(taskId)
  );

  saveRoadmap();
}

function changeRoadmapTaskStatus(yearId, goalId, milestoneId, taskId, status) {
  const task = findRoadmapTask(yearId, goalId, milestoneId, taskId);
  if (!task || !["todo", "in_progress", "done"].includes(status)) return;

  task.status = status;

  if (status !== "done") {
    const milestone = findMilestone(yearId, goalId, milestoneId);
    if (milestone) milestone.completed = false;
  }

  saveRoadmap();
}

function toggleMilestone(yearId, goalId, milestoneId, completed) {
  const milestone = findMilestone(yearId, goalId, milestoneId);
  if (!milestone) return;

  milestone.completed = Boolean(completed);
  saveRoadmap();
}

/* =====================================================
   ROADMAP RENDERING
===================================================== */

function renderRoadmap() {
  const list = $("roadmap-list");
  updateProgressIndicators();

  if (!list) return;

  list.innerHTML = state.roadmap.map(year => {
    const yearProgress = getYearProgress(year);

    return `
      <section class="roadmap-year">
        <div class="roadmap-year-head">
          <div>
            <span class="eyebrow">${esc(year.year)} · Weight ${year.weight}</span>
            <h3>${esc(year.title)}</h3>
          </div>
          <div class="roadmap-actions">
            <strong>${yearProgress}%</strong>
            <button class="button secondary" onclick="addGoal('${esc(year.id)}')">+ Goal</button>
          </div>
        </div>

        <div class="progress"><div style="width:${yearProgress}%"></div></div>

        <div class="roadmap-goals">
          ${year.goals.length ? year.goals.map(goal => {
            const goalProgress = getGoalProgress(goal);

            return `
              <details class="roadmap-goal" open>
                <summary>
                  <span>
                    <strong>${esc(goal.title)}</strong>
                    <span class="muted"> · Weight ${goal.weight}</span>
                  </span>
                  <strong>${goalProgress}%</strong>
                </summary>

                ${goal.description ? `<p class="muted">${esc(goal.description)}</p>` : ""}

                <div class="progress"><div style="width:${goalProgress}%"></div></div>

                <div class="roadmap-actions">
                  <button class="button secondary" onclick="editGoal('${esc(year.id)}','${esc(goal.id)}')">Edit goal</button>
                  <button class="button secondary" onclick="addMilestone('${esc(year.id)}','${esc(goal.id)}')">+ Milestone</button>
                  <button class="button secondary" onclick="deleteGoal('${esc(year.id)}','${esc(goal.id)}')">Delete goal</button>
                </div>

                <div class="roadmap-milestones">
                  ${goal.milestones.length ? goal.milestones.map(milestone => {
                    const progress = getMilestoneProgress(milestone);

                    return `
                      <article class="roadmap-milestone">
                        <div class="milestone-heading">
                          <label class="milestone-check">
                            <input type="checkbox"
                              ${milestone.completed ? "checked" : ""}
                              onchange="toggleMilestone('${esc(year.id)}','${esc(goal.id)}','${esc(milestone.id)}',this.checked)">
                            <span><strong>${esc(milestone.name)}</strong></span>
                          </label>
                          <strong>${progress}%</strong>
                        </div>

                        <div class="muted">Importance weight: ${milestone.weight}</div>

                        <p class="muted">
                          <strong>Completion criteria:</strong>
                          ${esc(milestone.criteria || "Not defined yet")}
                        </p>

                        ${milestone.due_date ? `<p class="muted">Due: ${esc(milestone.due_date)}</p>` : ""}

                        ${milestone.evidence
                          ? `<p class="muted">Evidence: ${esc(milestone.evidence)}</p>`
                          : `<p class="muted">Evidence not added.</p>`}

                        <div class="progress"><div style="width:${progress}%"></div></div>

                        <div class="roadmap-actions">
                          <button class="button secondary" onclick="editMilestone('${esc(year.id)}','${esc(goal.id)}','${esc(milestone.id)}')">Edit milestone</button>
                          <button class="button secondary" onclick="addRoadmapTask('${esc(year.id)}','${esc(goal.id)}','${esc(milestone.id)}')">+ Task</button>
                          <button class="button secondary" onclick="deleteMilestone('${esc(year.id)}','${esc(goal.id)}','${esc(milestone.id)}')">Delete milestone</button>
                        </div>

                        <div class="roadmap-tasks">
                          ${milestone.tasks.length ? milestone.tasks.map(task => `
                            <div class="roadmap-task">
                              <div class="roadmap-task-main">
                                <strong>${esc(task.title)}</strong>
                                ${task.description ? `<div class="muted">${esc(task.description)}</div>` : ""}
                                ${task.due_date ? `<div class="muted">Due: ${esc(task.due_date)}</div>` : ""}
                              </div>

                              <div class="roadmap-task-controls">
                                <select aria-label="Task status"
                                  onchange="changeRoadmapTaskStatus('${esc(year.id)}','${esc(goal.id)}','${esc(milestone.id)}','${esc(task.id)}',this.value)">
                                  <option value="todo" ${task.status === "todo" ? "selected" : ""}>To do</option>
                                  <option value="in_progress" ${task.status === "in_progress" ? "selected" : ""}>In progress</option>
                                  <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
                                </select>
                                <button class="button secondary" onclick="editRoadmapTask('${esc(year.id)}','${esc(goal.id)}','${esc(milestone.id)}','${esc(task.id)}')">Edit</button>
                                <button class="button secondary" onclick="deleteRoadmapTask('${esc(year.id)}','${esc(goal.id)}','${esc(milestone.id)}','${esc(task.id)}')">Delete</button>
                              </div>
                            </div>
                          `).join("") : `<div class="empty">No tasks yet. Add concrete actions to track progress.</div>`}
                        </div>
                      </article>`;
                  }).join("") : `<div class="empty">No milestones yet.</div>`}
                </div>
              </details>`;
          }).join("") : `<div class="empty">No goals yet. Add a goal to start planning this year.</div>`}
        </div>
      </section>`;
  }).join("");

  updateProgressIndicators();
}

function updateProgressIndicators() {
  const overall = getOverallProgress();

  [
    "roadmap-percent",
    "dashboard-roadmap-percent",
    "progress-roadmap-percent"
  ].forEach(id => {
    const element = $(id);
    if (element) element.textContent = `${overall}%`;
  });

  [
    "roadmap-bar",
    "dashboard-roadmap-bar",
    "progress-roadmap-bar"
  ].forEach(id => {
    const element = $(id);
    if (element) element.style.width = `${overall}%`;
  });
}

/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {
  const now = new Date();
  const sevenDays = new Date(now);
  sevenDays.setDate(sevenDays.getDate() + 7);

  const dueSoon = state.tasks.filter(task => {
    if (!task.due_date || (task.status || "todo") === "done") return false;
    const date = new Date(`${task.due_date}T23:59:59`);
    return date >= now && date <= sevenDays;
  });

  const overdue = state.tasks.filter(task => {
    if (!task.due_date || (task.status || "todo") === "done") return false;
    return new Date(`${task.due_date}T23:59:59`) < now;
  });

  if ($("due-soon")) $("due-soon").textContent = dueSoon.length;
  if ($("overdue-tasks")) $("overdue-tasks").textContent = overdue.length;

  updateProgressIndicators();
  renderDashboardTasks();
}

/* =====================================================
   NAVIGATION AND FILTERS
===================================================== */

document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", () => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = href.slice(1);

    document.querySelectorAll(".page").forEach(page =>
      page.classList.add("hidden")
    );

    $(target)?.classList.remove("hidden");

    document.querySelectorAll(".sidebar a").forEach(item =>
      item.classList.remove("active")
    );

    link.classList.add("active");

    if ($("page-title")) {
      $("page-title").textContent = link.textContent.trim();
    }

    if (target === "progress") renderRoadmap();
  });
});

$("paper-search")?.addEventListener("input", renderPapers);
$("paper-status")?.addEventListener("change", renderPapers);
$("paper-stream")?.addEventListener("change", renderPapers);

/* =====================================================
   START APPLICATION
===================================================== */

saveRoadmap();
renderRoadmap();
renderMeetings();
loadPapers();
loadTasks();
