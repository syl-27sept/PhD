// Silvia PhD - first architecture prototype.
// Data adapters will be connected to Supabase and Google Sheets in the next step.

const GOOGLE_SHEETS_API = "https://script.google.com/macros/s/AKfycbzrX9ILnV2CAUEywzkYn4iNASyx9XGfwbVSjg1CYuq9ennyf2XcbO9_j1Uc0gJDDumPZA/exec";

const state = {
  papers: [],
  tasks: JSON.parse(localStorage.getItem("silvia-phd-tasks") || "[]"),
  meetings: JSON.parse(localStorage.getItem("silvia-phd-meetings") || "[]"),
  roadmap: [
    { id: 1, name: "Literature review", progress: 0 },
    { id: 2, name: "Research direction", progress: 0 },
    { id: 3, name: "Methodology", progress: 0 },
    { id: 4, name: "First-year writing / proposal", progress: 0 }
  ]
};

const $ = id => document.getElementById(id);

async function loadPapers() {
  try {
    const response = await fetch(GOOGLE_SHEETS_API);
    if (!response.ok) throw new Error("Google Sheets request failed");

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
      table.innerHTML = `<tr><td colspan="6" class="empty">
        Could not load the Google Sheet: ${esc(error.message)}
      </td></tr>`;
    }
  }
}

function normalizeReadStatus(value) {
  const v = String(value ?? "").trim().toLowerCase();

  if (v === "read") return "Read";
  if (v === "reading") return "Reading";

  // Blank or anything else is treated as unread.
  return "Unread";
}

function populateStreams() {
  const select = $("paper-stream");
  const streams = [...new Set(
    state.papers.map(p => p.stream).filter(Boolean)
  )].sort();

  select.innerHTML =
    '<option value="">All literature streams</option>' +
    streams.map(s =>
      `<option value="${escAttr(s)}">${esc(s)}</option>`
    ).join("");
}

function render() {
  renderPapers();
  renderTasks();
  renderMeetings();
  renderRoadmap();
  updateDashboard();
}

function renderPapers() {
  const q = ($("paper-search")?.value || "").toLowerCase();
  const status = $("paper-status")?.value || "";
  const stream = $("paper-stream")?.value || "";
  const rows = state.papers.filter(p =>
    Object.values(p).join(" ").toLowerCase().includes(q) &&
    (!status || p.read === status) &&
    (!stream || p.stream === stream)
  );
  $("papers-table").innerHTML = rows.length ? rows.map(p => `
    <tr>
      <td>${esc(p.author)}</td>
      <td>${esc(p.year)}</td>
      <td>${p.link ? `<a href="${escAttr(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</td>
      <td>${esc(p.journal)}</td>
      <td>${esc(p.stream)}</td>
      <td>${esc(p.read)}</td>
    </tr>`).join("") : `<tr><td colspan="6" class="empty">No papers found.</td></tr>`;
  $("total-papers").textContent = state.papers.length || "0";
  $("unread-papers").textContent = state.papers.filter(p=>p.read==="Unread").length;
  $("reading-papers").textContent = state.papers.filter(p=>p.read==="Reading").length;
}

function renderTasks() {
  $("tasks-list").innerHTML = state.tasks.length ? state.tasks.map((t,i)=>`
    <div class="list-item"><strong>${esc(t.name)}</strong><div class="muted">${esc(t.due_date || "No due date")} · ${t.done ? "Done" : "To do"}</div></div>`).join("") : `<div class="empty">No tasks yet.</div>`;
  $("dashboard-tasks").innerHTML = state.tasks.filter(t=>!t.done).slice(0,5).map(t=>`<div class="list-item"><strong>${esc(t.name)}</strong><div class="muted">${esc(t.due_date || "No due date")}</div></div>`).join("") || `<div class="empty">No tasks due.</div>`;
  const now = new Date(); now.setHours(0,0,0,0);
  const soon = new Date(now); soon.setDate(soon.getDate()+7);
  $("due-soon").textContent = state.tasks.filter(t=>!t.done && t.due_date && new Date(t.due_date)<=soon).length;
}

function renderMeetings() {
  const sorted = [...state.meetings].sort((a,b)=>new Date(a.date)-new Date(b.date));
  $("meetings-list").innerHTML = sorted.length ? sorted.map(m=>`<div class="list-item"><strong>${esc(m.title || "Supervisor meeting")}</strong><div class="muted">${esc(m.date || "")}</div><div>${esc(m.notes || "")}</div></div>`).join("") : `<div class="empty">No meetings yet.</div>`;
  const next = sorted.find(m => m.date && new Date(m.date) >= new Date());
  $("next-meeting").innerHTML = next ? `<strong>${esc(next.title || "Supervisor meeting")}</strong><div class="muted">${esc(next.date)}</div>` : "No upcoming meeting.";
}

function renderRoadmap() {
  $("roadmap-list").innerHTML = state.roadmap.map(r=>`<div class="list-item"><div class="card-head"><strong>${esc(r.name)}</strong><span>${r.progress}%</span></div><div class="progress"><div style="width:${r.progress}%"></div></div></div>`).join("");
  const avg = state.roadmap.length ? Math.round(state.roadmap.reduce((a,r)=>a+r.progress,0)/state.roadmap.length) : 0;
  $("roadmap-percent").textContent = avg+"%"; $("roadmap-bar").style.width = avg+"%";
}

function updateDashboard(){ renderPapers(); }

function addTask() {
  $("task-dialog").showModal();
}
$("task-form").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  state.tasks.push({...data, done:false});
  localStorage.setItem("silvia-phd-tasks", JSON.stringify(state.tasks));
  e.target.reset(); $("task-dialog").close(); loadPapers();
});

["add-task","add-task-2"].forEach(id=>$(id).addEventListener("click",addTask));
$("paper-search").addEventListener("input",renderPapers);
$("paper-status").addEventListener("change",renderPapers);
$("paper-stream").addEventListener("change",renderPapers);

document.querySelectorAll(".sidebar a").forEach(a=>a.addEventListener("click",()=>{
  const target=a.getAttribute("href").slice(1);
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  $(target).classList.remove("hidden");
  $("page-title").textContent=a.textContent;
}));

function esc(v){return String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escAttr(v){return esc(v)}

loadPapers();
