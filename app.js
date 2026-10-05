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

    $("tasks-list").innerHTML = `
      <div class="empty">
        Could not load tasks from Supabase.
      </div>
    `;
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

  $("total-papers").textContent =
    state.papers.length;

  $("unread-papers").textContent =
    state.papers.filter(
      p => p.read === "Unread"
    ).length;

  $("reading-papers").textContent =
    state.papers.filter(
      p => p.read === "Reading"
    ).length;
}


function renderTasks() {
  const list = $("tasks-list");

  if (!state.tasks.length) {
    list.innerHTML = `
      <div class="empty">
        No tasks yet.
      </div>
    `;
  } else {
    list.innerHTML = state.tasks
      .map(
        task => `
          <div class="list-item">

            <div>
              <strong>
                ${esc(task.title)}
              </strong>

              ${
                task.description
                  ? `<div class="muted">
                      ${esc(task.description)}
                     </div>`
                  : ""
              }

              <div class="muted">
                ${
                  task.due_date
                    ? `Due: ${esc(task.due_date)}`
                    : "No due date"
                }

                ·

                ${
                  task.status === "done"
                    ? "Done"
                    : task.status === "in_progress"
                    ? "In progress"
                    : "To do"
                }
              </div>
            </div>

            <div style="margin-top:10px;display:flex;gap:8px;">

              ${
                task.status !== "done"
                  ? `
                    <button
                      class="button secondary"
                      onclick="completeTask('${task.id}')">
                      Mark done
                    </button>
                  `
                  : `
                    <button
                      class="button secondary"
                      onclick="reopenTask('${task.id}')">
                      Reopen
                    </button>
                  `
              }

              <button
                class="button secondary"
                onclick="deleteTask('${task.id}')">
                Delete
              </button>

            </div>

          </div>
        `
      )
      .join("");
  }

  const unfinishedTasks =
    state.tasks
      .filter(task => !task.done && task.status !== "done")
      .slice(0, 5);

  $("dashboard-tasks").innerHTML =
    unfinishedTasks.length
      ? unfinishedTasks
          .map(
            task => `
              <div class="list-item">
                <strong>${esc(task.title)}</strong>

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
          No tasks due.
        </div>
      `;
}


async function completeTask(taskId) {
  await updateTask(taskId, {
    status: "done"
  });
}


async function reopenTask(taskId) {
  await updateTask(taskId, {
    status: "todo"
  });
}


/* =========================
   ADD TASK
========================= */

function addTask() {
  $("task-dialog").showModal();
}


$("task-form").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const formData =
      Object.fromEntries(
        new FormData(event.target)
      );

    await createTask({
      title: formData.name,
      description: formData.description || null,
      due_date: formData.due_date || null,
      status: "todo"
    });

    event.target.reset();

    $("task-dialog").close();
  }
);


$("add-task").addEventListener(
  "click",
  addTask
);

$("add-task-2").addEventListener(
  "click",
  addTask
);


/* =========================
   MEETINGS
========================= */

function renderMeetings() {
  const sorted =
    [...state.meetings].sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

  $("meetings-list").innerHTML =
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


/* =========================
   ROADMAP
========================= */

function renderRoadmap() {
  $("roadmap-list").innerHTML =
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
                style="width:${item.progress}%">
              </div>
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
              total + item.progress,
            0
          ) /
            state.roadmap.length
        )
      : 0;

  $("roadmap-percent").textContent =
    average + "%";

  $("roadmap-bar").style.width =
    average + "%";
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {
  const now = new Date();

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
        new Date(task.due_date);

      return date <= sevenDays;
    });

  $("due-soon").textContent =
    dueSoon.length;
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
        const target =
          link
            .getAttribute("href")
            .slice(1);

        document
          .querySelectorAll(".page")
          .forEach(page =>
            page.classList.add(
              "hidden"
            )
          );

        $(target).classList.remove(
          "hidden"
        );

        $("page-title").textContent =
          link.textContent;
      }
    );
  });


/* =========================
   PAPER SEARCH / FILTERS
========================= */

$("paper-search").addEventListener(
  "input",
  renderPapers
);

$("paper-status").addEventListener(
  "change",
  renderPapers
);

$("paper-stream").addEventListener(
  "change",
  renderPapers
);


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
