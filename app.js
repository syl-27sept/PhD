```javascript
const GOOGLE_SHEETS_API =
  "https://script.google.com/macros/s/AKfycbzrX9ILnV2CAUEywzkYn4iNASyx9XGfwbVSjg1CYuq9ennyf2XcbO9_j1Uc0gJDDumPZA/exec";

const SUPABASE_TASKS_API =
  "https://ouspoawbetddlhojskxz.supabase.co/functions/v1/tasks";

const state = {
  papers: [],
  tasks: [],
  meetings: JSON.parse(
    localStorage.getItem("silvia-phd-meetings") || "[]"
  ),

  roadmap: [
    { id: 1, name: "Literature review", progress: 0 },
    { id: 2, name: "Research direction", progress: 0 },
    { id: 3, name: "Methodology", progress: 0 },
    { id: 4, name: "First-year writing / proposal", progress: 0 }
  ]
};


/* =========================
   GOOGLE SHEETS
========================= */

async function loadPapers() {
  try {
    const response = await fetch(GOOGLE_SHEETS_API);

    if (!response.ok) {
      throw new Error("Google Sheets request failed");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(data.error || "Unexpected Google Sheets response");
    }

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
    render();

  } catch (error) {
    console.error("Paper loading error:", error);

    const table = $("papers-table");

    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="6" class="empty">
            Could not load the Google Sheet.
          </td>
        </tr>
      `;
    }
  }
}


function normalizeReadStatus(value) {
  const v = String(value ?? "").trim().toLowerCase();

  if (v === "read") return "Read";
  if (v === "reading") return "Reading";

  return "Unread";
}


function populateStreams() {
  const select = $("paper-stream");

  if (!select) return;

  const streams = [
    ...new Set(
      state.papers
        .map(p => p.stream)
        .filter(Boolean)
    )
  ].sort();

  select.innerHTML =
    '<option value="">All literature streams</option>' +
    streams
      .map(
        stream =>
          `<option value="${escAttr(stream)}">${esc(stream)}</option>`
      )
      .join("");
}


/* =========================
   SUPABASE TASKS
========================= */

async function loadTasks() {
  try {
    const response = await fetch(SUPABASE_TASKS_API);

    if (!response.ok) {
      throw new Error("Could not load tasks");
    }

    state.tasks = await response.json();

    renderTasks();
    updateDashboard();

  } catch (error) {
    console.error("Task loading error:", error);

    const list = $("tasks-list");

    if (list) {
      list.innerHTML = `
        <div class="empty">
          Could not load tasks from Supabase.
        </div>
      `;
    }
  }
}


async function createTask(task) {
  try {
    const response = await fetch(SUPABASE_TASKS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
  }
}


async function updateTask(taskId, updates) {
  try {
    const response = await fetch(SUPABASE_TASKS_API, {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id: taskId,
        ...updates
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Could not update task");
    }

    const updatedTask = await response.json();

    const index = state.tasks.findIndex(
      task => task.id === taskId
    );

    if (index !== -1) {
      state.tasks[index] = updatedTask;
    }

    renderTasks();
    updateDashboard();

  } catch (error) {
    console.error("Update task error:", error);
    alert("Could not update the task.");
  }
}


async function deleteTask(taskId) {
  if (!confirm("Delete this task?")) {
    return;
  }

  try {
    const response = await fetch(SUPABASE_TASKS_API, {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id: taskId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Could not delete task");
    }

    state.tasks = state.tasks.filter(
      task => task.id !== taskId
    );

    renderTasks();
    updateDashboard();

  } catch (error) {
    console.error("Delete task error:", error);
    alert("Could not delete the task.");
  }
}


/* =========================
   RENDERING
========================= */

function render() {
  renderPapers();
  renderTasks();
  renderMeetings();
  renderRoadmap();
  updateDashboard();
}


function renderPapers() {
  const q =
    ($("paper-search")?.value || "").toLowerCase();

  const status =
    $("paper-status")?.value || "";

  const stream =
    $("paper-stream")?.value || "";

  const rows = state.papers.filter(p =>
    Object.values(p)
      .join(" ")
      .toLowerCase()
      .includes(q) &&
    (!status || p.read === status) &&
    (!stream || p.stream === stream)
  );

  $("papers-table").innerHTML =
    rows.length
      ? rows
          .map(
            p => `
              <tr>
                <td>${esc(p.author)}</td>
                <td>${esc(p.year)}</td>

                <td>
                  ${
                    p.link
                      ? `<a href="${escAttr(
                          p.link
                        )}" target="_blank" rel="noopener">
                          ${esc(p.title)}
                         </a>`
                      : esc(p.title)
                  }
                </td>

                <td>${esc(p.journal)}</td>
                <td>${esc(p.stream)}</td>
                <td>${esc(p.read)}</td>
              </tr>
            `
          )
          .join("")
      : `
          <tr>
            <td colspan="6" class="empty">
              No papers found.
            </td>
          </tr>
        `;

  if ($("total-papers")) {
    $("total-papers").textContent =
      state.papers.length;
  }

  if ($("unread-papers")) {
    $("unread-papers").textContent =
      state.papers.filter(
        p => p.read === "Unread"
      ).length;
  }

  if ($("reading-papers")) {
    $("reading-papers").textContent =
      state.papers.filter(
        p => p.read === "Reading"
      ).length;
  }
}


/* =========================
   TASK DISPLAY
========================= */

function renderTasks() {
  const list = $("tasks-list");

  if (!list) return;

  if (!state.tasks.length) {
    list.innerHTML = `
      <div class="empty">
        No tasks yet.
      </div>
    `;
  } else {
    list.innerHTML = state.tasks
      .map(task => {

        const statusLabel =
          task.status === "done"
            ? "Done"
            : task.status === "in_progress"
            ? "In progress"
            : "To do";

        return `
          <div class="list-item">

            <div>
              <strong>
                ${esc(task.title)}
              </strong>

              ${
                task.description
                  ? `
                    <div class="muted">
                      ${esc(task.description)}
                    </div>
                  `
                  : ""
              }

              <div class="muted">
                ${
                  task.due_date
                    ? `Due: ${esc(task.due_date)}`
                    : "No due date"
                }
                ·
                ${statusLabel}
              </div>
            </div>

            <div
              style="
                margin-top:10px;
                display:flex;
                gap:8px;
                flex-wrap:wrap;
              "
            >

              <select
                onchange="changeTaskStatus('${task.id}', this.value)"
              >
                <option
                  value="todo"
                  ${task.status === "todo" ? "selected" : ""}
                >
                  To do
                </option>

                <option
                  value="in_progress"
                  ${task.status === "in_progress" ? "selected" : ""}
                >
                  In progress
                </option>

                <option
                  value="done"
                  ${task.status === "done" ? "selected" : ""}
                >
                  Done
                </option>
              </select>

              <button
                class="button secondary"
                onclick="editTask('${task.id}')"
              >
                Edit
              </button>

              <button
                class="button secondary"
                onclick="deleteTask('${task.id}')"
              >
                Delete
              </button>

            </div>

          </div>
        `;
      })
      .join("");
  }

  renderDashboardTasks();
}


function renderDashboardTasks() {
  const dashboard =
    $("dashboard-tasks");

  if (!dashboard) return;

  const unfinishedTasks =
    state.tasks
      .filter(
        task =>
          task.status !== "done"
      )
      .sort((a, b) => {

        if (!a.due_date) return 1;
        if (!b.due_date) return -1;

        return (
          new Date(a.due_date) -
          new Date(b.due_date)
        );
      })
      .slice(0, 5);

  dashboard.innerHTML =
    unfinishedTasks.length
      ? unfinishedTasks
          .map(
            task => `
              <div class="list-item">

                <strong>
                  ${esc(task.title)}
                </strong>

                <div class="muted">
                  ${
                    task.due_date
                      ? `Due: ${esc(task.due_date)}`
                      : "No due date"
                  }
                </div>

              </div>
            `
          )
          .join("")
      : `
          <div class="empty">
            No outstanding tasks.
          </div>
        `;
}


/* =========================
   TASK STATUS
========================= */

async function changeTaskStatus(
  taskId,
  status
) {
  await updateTask(taskId, {
    status
  });
}


/* =========================
   EDIT TASK
========================= */

async function editTask(taskId) {
  const task =
    state.tasks.find(
      item => item.id === taskId
    );

  if (!task) return;

  const title =
    prompt(
      "Task title:",
      task.title
    );

  if (title === null) {
    return;
  }

  const description =
    prompt(
      "Description:",
      task.description || ""
    );

  if (description === null) {
    return;
  }

  const dueDate =
    prompt(
      "Due date (YYYY-MM-DD), or leave blank:",
      task.due_date || ""
    );

  if (dueDate === null) {
    return;
  }

  await updateTask(taskId, {
    title: title.trim(),
    description:
      description.trim() || null,
    due_date:
      dueDate.trim() || null
  });
}


/* =========================
   ADD TASK
========================= */

function addTask() {
  const dialog =
    $("task-dialog");

  if (dialog) {
    dialog.showModal();
  }
}


const taskForm =
  $("task-form");

if (taskForm) {
  taskForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const formData =
        Object.fromEntries(
          new FormData(event.target)
        );

      await createTask({
        title:
          formData.name?.trim() ||
          "Untitled task",

        description:
          formData.description?.trim() ||
          null,

        due_date:
          formData.due_date ||
          null,

        status: "todo"
      });

      event.target.reset();

      $("task-dialog").close();
    }
  );
}


if ($("add-task")) {
  $("add-task").addEventListener(
    "click",
    addTask
  );
}


if ($("add-task-2")) {
  $("add-task-2").addEventListener(
    "click",
    addTask
  );
}


/* =========================
   MEETINGS
========================= */

function renderMeetings() {
  const list =
    $("meetings-list");

  if (!list) return;

  const sorted =
    [...state.meetings].sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

  list.innerHTML =
    sorted.length
      ? sorted
          .map(
            meeting => `
              <div class="list-item">

                <strong>
                  ${esc(
                    meeting.title ||
                    "Supervisor meeting"
                  )}
                </strong>

                <div class="muted">
                  ${esc(
                    meeting.date || ""
                  )}
                </div>

                <div>
                  ${esc(
                    meeting.notes || ""
                  )}
                </div>

              </div>
            `
          )
          .join("")
      : `
          <div class="empty">
            No meetings yet.
          </div>
        `;

  const next =
    sorted.find(
      meeting =>
        meeting.date &&
        new Date(meeting.date) >=
          new Date()
    );

  if ($("next-meeting")) {
    $("next-meeting").innerHTML =
      next
        ? `
            <strong>
              ${esc(
                next.title ||
                "Supervisor meeting"
              )}
            </strong>

            <div class="muted">
              ${esc(next.date)}
            </div>
          `
        : "No upcoming meeting.";
  }
}


/* =========================
   ROADMAP
========================= */

function renderRoadmap() {
  const list =
    $("roadmap-list");

  if (!list) return;

  list.innerHTML =
    state.roadmap
      .map(
        item => `
          <div class="list-item">

            <div class="card-head">
              <strong>
                ${esc(item.name)}
              </strong>

              <span>
                ${item.progress}%
              </span>
            </div>

            <div class="progress">
              <div
                style="width:${item.progress}%"
              ></div>
            </div>

          </div>
        `
      )
      .join("");

  const average =
    state.roadmap.length
      ? Math.round(
          state.roadmap.reduce(
            (total, item) =>
              total +
              item.progress,
            0
          ) /
            state.roadmap.length
        )
      : 0;

  if ($("roadmap-percent")) {
    $("roadmap-percent").textContent =
      average + "%";
  }

  if ($("roadmap-bar")) {
    $("roadmap-bar").style.width =
      average + "%";
  }
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {
  const now =
    new Date();

  const sevenDays =
    new Date(now);

  sevenDays.setDate(
    sevenDays.getDate() + 7
  );

  const dueSoon =
    state.tasks.filter(task => {

      if (
        !task.due_date ||
        task.status === "done"
      ) {
        return false;
      }

      const date =
        new Date(
          task.due_date +
          "T23:59:59"
        );

      return date <=
        sevenDays;
    });

  const overdue =
    state.tasks.filter(task => {

      if (
        !task.due_date ||
        task.status === "done"
      ) {
        return false;
      }

      const date =
        new Date(
          task.due_date +
          "T23:59:59"
        );

      return date < now;
    });

  if ($("due-soon")) {
    $("due-soon").textContent =
      dueSoon.length;
  }

  if ($("overdue-tasks")) {
    $("overdue-tasks").textContent =
      overdue.length;
  }
}


/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll(".sidebar a")
  .forEach(link => {

    link.addEventListener(
      "click",
      () => {

        const href =
          link.getAttribute("href");

        if (
          !href ||
          !href.startsWith("#")
        ) {
          return;
        }

        const target =
          href.slice(1);

        document
          .querySelectorAll(".page")
          .forEach(page =>
            page.classList.add(
              "hidden"
            )
          );

        const targetPage =
          $(target);

        if (targetPage) {
          targetPage.classList.remove(
            "hidden"
          );
        }

        if ($("page-title")) {
          $("page-title").textContent =
            link.textContent.trim();
        }
      }
    );
  });


/* =========================
   PAPER FILTERS
========================= */

if ($("paper-search")) {
  $("paper-search").addEventListener(
    "input",
    renderPapers
  );
}

if ($("paper-status")) {
  $("paper-status").addEventListener(
    "change",
    renderPapers
  );
}

if ($("paper-stream")) {
  $("paper-stream").addEventListener(
    "change",
    renderPapers
  );
}


/* =========================
   HELPERS
========================= */

function $(id) {
  return document.getElementById(id);
}


function esc(value) {
  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
  );
}


function escAttr(value) {
  return esc(value);
}


/* =========================
   START APPLICATION
========================= */

loadPapers();
loadTasks();
renderMeetings();
renderRoadmap();
```
