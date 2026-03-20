import { useState, useMemo, useEffect, useRef } from "react";

const CATEGORIES = ["Academic", "Society", "Personal", "Work", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const PRIORITY_CONFIG = {
  Low:    { color: "#6ee7b7", bg: "rgba(110,231,183,0.12)", dot: "#6ee7b7" },
  Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  dot: "#fbbf24" },
  High:   { color: "#f97316", bg: "rgba(249,115,22,0.12)",  dot: "#f97316" },
  Urgent: { color: "#f43f5e", bg: "rgba(244,63,94,0.15)",   dot: "#f43f5e" },
};

const CATEGORY_COLORS = {
  Academic: "#818cf8",
  Society:  "#34d399",
  Personal: "#f472b6",
  Work:     "#fbbf24",
  Other:    "#94a3b8",
};

const initialCommitments = [
  {
    id: 1,
    name: "LSE History Society",
    category: "Society",
    tasks: [
      { id: 1, text: "Prepare speaker event agenda", priority: "High", due: "2026-03-15", done: false },
      { id: 2, text: "Send newsletter to members", priority: "Medium", due: "2026-03-12", done: true },
    ],
  },
  {
    id: 2,
    name: "Dissertation",
    category: "Academic",
    tasks: [
      { id: 3, text: "Complete literature review draft", priority: "Urgent", due: "2026-03-18", done: false },
      { id: 4, text: "Meet with supervisor", priority: "High", due: "2026-03-11", done: false },
    ],
  },
];

const today = new Date();
today.setHours(0, 0, 0, 0);

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function DueBadge({ due }) {
  if (!due) return null;
  const days = getDaysUntil(due);
  let label, color;
  if (days < 0)        { label = "Overdue";       color = "#f43f5e"; }
  else if (days === 0) { label = "Due today";      color = "#f97316"; }
  else if (days <= 3)  { label = `${days}d left`; color = "#fbbf24"; }
  else                 { label = `${days}d`;       color = "#94a3b8"; }
  return (
    <span style={{
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em",
      color, border: `1px solid ${color}`, borderRadius: 4,
      padding: "1px 6px", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function ProgressBar({ tasks }) {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 99,
          background: pct === 100 ? "#34d399" : "linear-gradient(90deg,#818cf8,#f472b6)",
          transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
      <span style={{ fontSize: "0.7rem", color: pct === 100 ? "#34d399" : "#94a3b8", minWidth: 32, textAlign: "right" }}>
        {done}/{total}
      </span>
    </div>
  );
}

// ── Urgent Sidebar ────────────────────────────────────────────────────────────
function UrgentSidebar({ commitments, onToggleTask, onClose }) {
  const priorityOrder = { Urgent: 0, High: 1 };

  const urgentTasks = useMemo(() => {
    const items = [];
    commitments.forEach(com => {
      com.tasks.forEach(task => {
        if (!task.done && (task.priority === "Urgent" || task.priority === "High")) {
          items.push({ ...task, commitmentName: com.name, commitmentCategory: com.category, commitmentId: com.id });
        }
      });
    });
    return items.sort((a, b) => {
      const pd = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
      if (pd !== 0) return pd;
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due) - new Date(b.due);
    });
  }, [commitments]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)", zIndex: 40,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Sidebar panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 92vw)",
        background: "#0d1117",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 50,
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.25s cubic-bezier(.4,0,.2,1)",
        overflowY: "auto",
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky", top: 0, background: "#0d1117", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{
                fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#f43f5e", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                  background: "#f43f5e", boxShadow: "0 0 8px #f43f5e",
                  animation: "pulse 1.8s ease-in-out infinite",
                }} />
                Priority Focus
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                Urgent & High
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4 }}>
                {urgentTasks.length} task{urgentTasks.length !== 1 ? "s" : ""} need your attention
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                color: "#475569", fontSize: "1.2rem", padding: "4px 8px",
                borderRadius: 6, transition: "color 0.15s", lineHeight: 1,
              }}
            >✕</button>
          </div>
        </div>

        {/* Task list */}
        <div style={{ padding: "16px 24px", flex: 1 }}>
          {urgentTasks.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>✓</div>
              <p style={{ color: "#34d399", fontSize: "1rem", fontWeight: 600 }}>All clear</p>
              <p style={{ color: "#334155", fontSize: "0.85rem", marginTop: 4, fontStyle: "italic" }}>
                No urgent or high priority tasks remaining.
              </p>
            </div>
          ) : (
            urgentTasks.map((task, i) => {
              const pc       = PRIORITY_CONFIG[task.priority];
              const catColor = CATEGORY_COLORS[task.commitmentCategory] || "#94a3b8";
              const isUrgent = task.priority === "Urgent";

              return (
                <div key={task.id} style={{
                  marginBottom: 12,
                  background: isUrgent ? "rgba(244,63,94,0.05)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isUrgent ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  animation: `fadeUp 0.2s ease ${i * 0.04}s both`,
                }}>
                  {/* Commitment tag */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: catColor, flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: catColor,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>{task.commitmentName}</span>
                  </div>

                  {/* Task row */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {/* Priority dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", background: pc.dot,
                      marginTop: 4, flexShrink: 0, boxShadow: `0 0 6px ${pc.dot}99`,
                    }} />

                    {/* Checkbox */}
                    <button onClick={() => onToggleTask(task.commitmentId, task.id)} style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: "1.5px solid rgba(255,255,255,0.15)",
                      background: "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#34d399", fontSize: "0.7rem", marginTop: 1,
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", color: "#e2e8f0", lineHeight: 1.45 }}>
                        {task.text}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{
                          fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
                          textTransform: "uppercase", color: pc.color,
                          background: pc.bg, borderRadius: 3, padding: "1px 6px",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}>{task.priority}</span>
                        <DueBadge due={task.due} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [commitments, setCommitments] = useState(() => {
    const saved = localStorage.getItem("commitments");
    return saved ? JSON.parse(saved) : initialCommitments;
  });

  useEffect(() => {
    localStorage.setItem("commitments", JSON.stringify(commitments));
  }, [commitments]);

  const [expandedId, setExpandedId]               = useState(null);
  const [filterCategory, setFilterCategory]       = useState("All");
  const [showAddCommitment, setShowAddCommitment] = useState(false);
  const [newCom, setNewCom]                       = useState({ name: "", category: "Academic" });
  const [addTaskFor, setAddTaskFor]               = useState(null);
  const [newTask, setNewTask]                     = useState({ text: "", priority: "Medium", due: "" });
  const [sortBy, setSortBy]                       = useState("priority");
  const [isFullscreen, setIsFullscreen]           = useState(false);
  const [showUrgent, setShowUrgent]               = useState(false);

  const [editingComId, setEditingComId]   = useState(null);
  const [editComDraft, setEditComDraft]   = useState({ name: "", category: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskDraft, setEditTaskDraft] = useState({ text: "", priority: "", due: "" });

  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Close sidebar on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setShowUrgent(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const urgentCount = useMemo(() =>
    commitments.flatMap(c => c.tasks).filter(t => !t.done && (t.priority === "Urgent" || t.priority === "High")).length,
    [commitments]
  );

  const filtered = useMemo(() => {
    return filterCategory === "All"
      ? commitments
      : commitments.filter(c => c.category === filterCategory);
  }, [commitments, filterCategory]);

  const addCommitment = () => {
    if (!newCom.name.trim()) return;
    setCommitments(prev => [...prev, { id: Date.now(), name: newCom.name.trim(), category: newCom.category, tasks: [] }]);
    setNewCom({ name: "", category: "Academic" });
    setShowAddCommitment(false);
  };

  const removeCommitment = (id) => setCommitments(prev => prev.filter(c => c.id !== id));

  const saveEditCom = (id) => {
    if (!editComDraft.name.trim()) return;
    setCommitments(prev => prev.map(c =>
      c.id !== id ? c : { ...c, name: editComDraft.name.trim(), category: editComDraft.category }
    ));
    setEditingComId(null);
  };

  const addTask = (comId) => {
    if (!newTask.text.trim()) return;
    setCommitments(prev => prev.map(c =>
      c.id !== comId ? c : {
        ...c,
        tasks: [...c.tasks, { id: Date.now(), text: newTask.text.trim(), priority: newTask.priority, due: newTask.due, done: false }]
      }
    ));
    setNewTask({ text: "", priority: "Medium", due: "" });
    setAddTaskFor(null);
  };

  const toggleTask = (comId, taskId) => {
    setCommitments(prev => prev.map(c =>
      c.id !== comId ? c : { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
    ));
  };

  const removeTask = (comId, taskId) => {
    setCommitments(prev => prev.map(c =>
      c.id !== comId ? c : { ...c, tasks: c.tasks.filter(t => t.id !== taskId) }
    ));
  };

  const saveEditTask = (comId, taskId) => {
    if (!editTaskDraft.text.trim()) return;
    setCommitments(prev => prev.map(c =>
      c.id !== comId ? c : {
        ...c,
        tasks: c.tasks.map(t =>
          t.id !== taskId ? t : { ...t, text: editTaskDraft.text.trim(), priority: editTaskDraft.priority, due: editTaskDraft.due }
        )
      }
    ));
    setEditingTaskId(null);
  };

  const getSortedTasks = (tasks) => {
    const order = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    return [...tasks].sort((a, b) => {
      if (sortBy === "priority") return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
      if (sortBy === "due") {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return new Date(a.due) - new Date(b.due);
      }
      return 0;
    });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)", color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7,
    padding: "6px 10px", fontSize: "0.88rem", fontFamily: "'Crimson Pro', Georgia, serif",
  };

  return (
    <div ref={containerRef} style={{ minHeight: "100vh", background: "#0d1117", fontFamily: "'Crimson Pro', Georgia, serif", color: "#e2e8f0", padding: "0 0 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        input, select { outline: none; font-family: inherit; }
        button { cursor: pointer; font-family: inherit; border: none; background: none; }
        .task-row:hover .task-actions { opacity: 1 !important; }
        .com-card { transition: box-shadow 0.2s; }
        .com-card:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.07) !important; }
        .pill-btn { transition: all 0.15s; }
        .pill-btn:hover { opacity: 0.8; }
        .add-task-btn:hover { background: rgba(255,255,255,0.06) !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        .icon-btn:hover { color: #e2e8f0 !important; }
        .fs-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .urgent-btn:hover { background: rgba(244,63,94,0.15) !important; border-color: rgba(244,63,94,0.5) !important; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "28px 32px 22px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#0d1117", zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "#475569", textTransform: "uppercase", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "-0.02em", color: "#f1f5f9" }}>My Commitments</h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Urgent toggle */}
          <button
            className="urgent-btn"
            onClick={() => setShowUrgent(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              color: urgentCount > 0 ? "#f43f5e" : "#475569",
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${urgentCount > 0 ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.08)"}`,
              background: urgentCount > 0 ? "rgba(244,63,94,0.08)" : "transparent",
              fontSize: "0.82rem", fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: "0.04em", transition: "all 0.15s",
            }}
          >
            {urgentCount > 0 && (
              <span style={{
                display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                background: "#f43f5e", boxShadow: "0 0 8px #f43f5e",
                animation: "pulse 1.8s ease-in-out infinite",
              }} />
            )}
            Focus
            {urgentCount > 0 && (
              <span style={{
                background: "#f43f5e", color: "#fff", borderRadius: 99,
                fontSize: "0.65rem", fontWeight: 700, padding: "1px 7px", minWidth: 20, textAlign: "center",
              }}>{urgentCount}</span>
            )}
          </button>

          <button className="fs-btn" onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} style={{
            color: "#94a3b8", padding: "8px 12px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.78rem",
            fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.05em",
            transition: "background 0.15s", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>⤢</span>
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>

          <button onClick={() => setShowAddCommitment(true)} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#818cf8,#f472b6)",
            color: "#fff", borderRadius: 8, padding: "9px 18px",
            fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.02em",
          }}>
            + New Commitment
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 32px 0" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'JetBrains Mono',monospace", marginRight: 4 }}>Filter</span>
          {["All", ...CATEGORIES].map(cat => (
            <button key={cat} className="pill-btn" onClick={() => setFilterCategory(cat)} style={{
              padding: "4px 14px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600,
              border: "1px solid",
              borderColor: filterCategory === cat ? (CATEGORY_COLORS[cat] || "#818cf8") : "rgba(255,255,255,0.1)",
              color: filterCategory === cat ? (CATEGORY_COLORS[cat] || "#818cf8") : "#64748b",
              background: filterCategory === cat ? `${(CATEGORY_COLORS[cat] || "#818cf8")}18` : "transparent",
            }}>{cat}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'JetBrains Mono',monospace" }}>Sort</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              background: "rgba(255,255,255,0.05)", color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
              padding: "4px 10px", fontSize: "0.78rem",
            }}>
              <option value="priority">Priority</option>
              <option value="due">Due date</option>
            </select>
          </div>
        </div>

        {/* Stats strip */}
        {(() => {
          const allTasks = commitments.flatMap(c => c.tasks);
          const overdue  = allTasks.filter(t => !t.done && t.due && getDaysUntil(t.due) < 0).length;
          const done     = allTasks.filter(t => t.done).length;
          return (
            <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              {[
                { label: "Commitments",  val: commitments.length,                   col: "#818cf8" },
                { label: "Open tasks",   val: allTasks.filter(t => !t.done).length, col: "#94a3b8" },
                { label: "High priority",val: urgentCount,                          col: "#f97316" },
                { label: "Overdue",      val: overdue,                              col: "#f43f5e" },
                { label: "Completed",    val: done,                                 col: "#34d399" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "12px 18px", minWidth: 100,
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600, color: s.col, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: "0.68rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Commitment cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 16 }}>
          {filtered.map(com => {
            const isOpen      = expandedId === com.id;
            const isEditingCom = editingComId === com.id;
            const catColor    = CATEGORY_COLORS[com.category] || "#94a3b8";
            const sortedTasks = getSortedTasks(com.tasks);

            return (
              <div key={com.id} className="com-card" style={{
                background: "#111827", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, overflow: "hidden", borderTop: `3px solid ${catColor}`,
              }}>
                <div style={{ padding: "16px 18px 12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      {!isEditingCom && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{
                            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em",
                            textTransform: "uppercase", color: catColor,
                            background: `${catColor}18`, borderRadius: 4, padding: "2px 7px",
                            fontFamily: "'JetBrains Mono',monospace",
                          }}>{com.category}</span>
                        </div>
                      )}

                      {isEditingCom ? (
                        <div style={{ marginBottom: 10 }}>
                          <input autoFocus value={editComDraft.name}
                            onChange={e => setEditComDraft(p => ({ ...p, name: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter") saveEditCom(com.id); if (e.key === "Escape") setEditingComId(null); }}
                            style={{ ...inputStyle, width: "100%", marginBottom: 8, fontSize: "1rem" }} />
                          <select value={editComDraft.category}
                            onChange={e => setEditComDraft(p => ({ ...p, category: e.target.value }))}
                            style={{ ...inputStyle, width: "100%", marginBottom: 10 }}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveEditCom(com.id)} style={{
                              background: "linear-gradient(135deg,#818cf8,#f472b6)", color: "#fff",
                              borderRadius: 6, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 600,
                            }}>Save</button>
                            <button onClick={() => setEditingComId(null)} style={{ color: "#475569", fontSize: "0.78rem", padding: "4px 8px" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <h2 onClick={() => setExpandedId(isOpen ? null : com.id)}
                          style={{ fontSize: "1.1rem", fontWeight: 600, letterSpacing: "-0.01em", color: "#f1f5f9", marginBottom: 10, cursor: "pointer" }}>
                          {com.name}
                        </h2>
                      )}
                      {!isEditingCom && <ProgressBar tasks={com.tasks} />}
                    </div>

                    {!isEditingCom && (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="icon-btn" title="Edit commitment" onClick={() => {
                          setEditingComId(com.id);
                          setEditComDraft({ name: com.name, category: com.category });
                          setExpandedId(com.id);
                        }} style={{ color: "#475569", fontSize: "0.9rem", padding: "4px 6px", borderRadius: 6, transition: "color 0.15s" }}>✎</button>
                        <button className="icon-btn" title="Remove commitment" onClick={() => removeCommitment(com.id)}
                          style={{ color: "#475569", fontSize: "1rem", padding: "4px 6px", borderRadius: 6, transition: "color 0.15s" }}>✕</button>
                      </div>
                    )}
                  </div>

                  {!isEditingCom && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, cursor: "pointer" }}
                      onClick={() => setExpandedId(isOpen ? null : com.id)}>
                      <span style={{ fontSize: "0.7rem", color: "#475569", fontFamily: "'JetBrains Mono',monospace" }}>
                        {isOpen ? "▲ collapse" : "▼ expand"}
                      </span>
                    </div>
                  )}
                </div>

                {isOpen && !isEditingCom && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "0 18px 14px" }}>
                    {sortedTasks.length === 0 && (
                      <p style={{ color: "#334155", fontSize: "0.85rem", fontStyle: "italic", padding: "14px 0 6px" }}>No tasks yet.</p>
                    )}
                    {sortedTasks.map(task => {
                      const pc            = PRIORITY_CONFIG[task.priority];
                      const isEditingTask = editingTaskId === task.id;
                      return (
                        <div key={task.id} className="task-row" style={{
                          padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                          opacity: task.done && !isEditingTask ? 0.45 : 1, transition: "opacity 0.2s", position: "relative",
                        }}>
                          {isEditingTask ? (
                            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                              <input autoFocus value={editTaskDraft.text}
                                onChange={e => setEditTaskDraft(p => ({ ...p, text: e.target.value }))}
                                onKeyDown={e => { if (e.key === "Enter") saveEditTask(com.id, task.id); if (e.key === "Escape") setEditingTaskId(null); }}
                                style={{ ...inputStyle, width: "100%", marginBottom: 8 }} />
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                                <select value={editTaskDraft.priority} onChange={e => setEditTaskDraft(p => ({ ...p, priority: e.target.value }))}
                                  style={{ ...inputStyle, fontSize: "0.78rem" }}>
                                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                                </select>
                                <input type="date" value={editTaskDraft.due} onChange={e => setEditTaskDraft(p => ({ ...p, due: e.target.value }))}
                                  style={{ ...inputStyle, color: "#94a3b8", fontSize: "0.78rem" }} />
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => saveEditTask(com.id, task.id)} style={{
                                  background: "linear-gradient(135deg,#818cf8,#f472b6)", color: "#fff",
                                  borderRadius: 6, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 600,
                                }}>Save</button>
                                <button onClick={() => setEditingTaskId(null)} style={{ color: "#475569", fontSize: "0.78rem", padding: "4px 8px" }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: pc.dot, marginTop: 5, flexShrink: 0, boxShadow: `0 0 6px ${pc.dot}99` }} />
                              <button onClick={() => toggleTask(com.id, task.id)} style={{
                                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                border: `1.5px solid ${task.done ? "#34d399" : "rgba(255,255,255,0.15)"}`,
                                background: task.done ? "#34d39922" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#34d399", fontSize: "0.7rem", marginTop: 2,
                              }}>{task.done ? "✓" : ""}</button>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.88rem", color: task.done ? "#475569" : "#cbd5e1", textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>
                                  {task.text}
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                                  <span style={{
                                    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
                                    textTransform: "uppercase", color: pc.color, background: pc.bg,
                                    borderRadius: 3, padding: "1px 6px", fontFamily: "'JetBrains Mono',monospace",
                                  }}>{task.priority}</span>
                                  <DueBadge due={task.due} />
                                </div>
                              </div>
                              <div className="task-actions" style={{ display: "flex", gap: 2, opacity: 0, transition: "opacity 0.15s" }}>
                                <button className="icon-btn" title="Edit task" onClick={() => {
                                  setEditingTaskId(task.id);
                                  setEditTaskDraft({ text: task.text, priority: task.priority, due: task.due || "" });
                                }} style={{ color: "#475569", fontSize: "0.85rem", padding: "2px 5px", transition: "color 0.15s" }}>✎</button>
                                <button className="icon-btn" title="Remove task" onClick={() => removeTask(com.id, task.id)}
                                  style={{ color: "#475569", fontSize: "0.85rem", padding: "2px 5px", transition: "color 0.15s" }}>✕</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {addTaskFor === com.id ? (
                      <div style={{ marginTop: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, border: "1px solid rgba(255,255,255,0.07)" }}>
                        <input autoFocus value={newTask.text}
                          onChange={e => setNewTask(p => ({ ...p, text: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") addTask(com.id); if (e.key === "Escape") setAddTaskFor(null); }}
                          placeholder="Task description…"
                          style={{ width: "100%", background: "transparent", color: "#e2e8f0", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", borderRadius: 0, padding: "6px 0", fontSize: "0.88rem", marginBottom: 12, outline: "none", fontFamily: "'Crimson Pro', Georgia, serif" }} />
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                            style={{ ...inputStyle, fontSize: "0.78rem" }}>
                            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                          </select>
                          <input type="date" value={newTask.due} onChange={e => setNewTask(p => ({ ...p, due: e.target.value }))}
                            style={{ ...inputStyle, color: "#94a3b8", fontSize: "0.78rem" }} />
                          <button onClick={() => addTask(com.id)} style={{
                            background: "linear-gradient(135deg,#818cf8,#f472b6)", color: "#fff",
                            borderRadius: 6, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 600,
                          }}>Add</button>
                          <button onClick={() => setAddTaskFor(null)} style={{ color: "#475569", fontSize: "0.78rem", padding: "4px 8px" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="add-task-btn" onClick={() => { setAddTaskFor(com.id); setNewTask({ text: "", priority: "Medium", due: "" }); }}
                        style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.08)", color: "#475569", fontSize: "0.8rem", letterSpacing: "0.03em", transition: "all 0.15s", textAlign: "center" }}>
                        + Add task
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#334155", fontSize: "1rem", fontStyle: "italic", paddingTop: 60 }}>
            No commitments in this category yet.
          </div>
        )}
      </div>

      {/* Urgent sidebar */}
      {showUrgent && (
        <UrgentSidebar
          commitments={commitments}
          onToggleTask={toggleTask}
          onClose={() => setShowUrgent(false)}
        />
      )}

      {/* Add commitment modal */}
      {showAddCommitment && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24,
        }} onClick={() => setShowAddCommitment(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#111827", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: 28, width: "100%", maxWidth: 400,
          }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 20, color: "#f1f5f9" }}>New Commitment</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569", fontFamily: "'JetBrains Mono',monospace", display: "block", marginBottom: 6 }}>Name</label>
              <input autoFocus value={newCom.name}
                onChange={e => setNewCom(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") addCommitment(); }}
                placeholder="e.g. LSE Debate Society"
                style={{ ...inputStyle, width: "100%", padding: "10px 14px", fontSize: "0.9rem" }} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569", fontFamily: "'JetBrains Mono',monospace", display: "block", marginBottom: 6 }}>Category</label>
              <select value={newCom.category} onChange={e => setNewCom(p => ({ ...p, category: e.target.value }))}
                style={{ ...inputStyle, width: "100%", padding: "10px 14px", fontSize: "0.88rem" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddCommitment(false)} style={{ color: "#475569", padding: "9px 16px", fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={addCommitment} style={{
                background: "linear-gradient(135deg,#818cf8,#f472b6)", color: "#fff",
                borderRadius: 8, padding: "9px 22px", fontSize: "0.88rem", fontWeight: 600,
              }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
