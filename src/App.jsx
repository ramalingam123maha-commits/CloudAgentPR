import { useState, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

const FILTERS = ['All', 'Active', 'Completed'];

const priorityStyles = {
  High:   'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
  Low:    'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
};

const INITIAL_TASKS = [
  { id: 1, title: 'Plan sprint tasks',       completed: true,  priority: 'High'   },
  { id: 2, title: 'Review design mockups',   completed: false, priority: 'Medium' },
  { id: 3, title: 'Prepare release notes',   completed: false, priority: 'Low'    },
];

export default function App() {
  const [tasks, setTasks]       = useLocalStorage('todo-tasks', INITIAL_TASKS);
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter]     = useState('All');
  const inputRef = useRef(null);

  const completed = tasks.filter((t) => t.completed).length;
  const remaining = tasks.length - completed;

  const filtered =
    filter === 'Active'    ? tasks.filter((t) => !t.completed) :
    filter === 'Completed' ? tasks.filter((t) =>  t.completed) :
    tasks;

  function addTask(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((cur) => [{ id: Date.now(), title: trimmed, completed: false, priority }, ...cur]);
    setTitle('');
    setPriority('Medium');
    inputRef.current?.focus();
  }

  function toggleTask(id) {
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function removeTask(id) {
    setTasks((cur) => cur.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTasks((cur) => cur.filter((t) => !t.completed));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* ── Header ── */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
                Task management app
              </span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Organize work with clarity.
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
                  Capture tasks, assign priorities, and keep track of progress in one clean dashboard.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Total"  value={tasks.length} />
              <Stat label="Done"   value={completed}    />
              <Stat label="Open"   value={remaining}    />
            </div>
          </div>
        </section>

        {/* ── Main grid ── */}
        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* Add-task form */}
          <form
            onSubmit={addTask}
            className="h-fit rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30"
          >
            <h2 className="text-xl font-semibold">Add a task</h2>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Task title</span>
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finalize onboarding checklist"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Priority</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 active:scale-95"
              >
                + Add task
              </button>
            </div>
          </form>

          {/* Task list */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">

            {/* List header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Task list</h2>
                <p className="mt-1 text-sm text-slate-400">Click a task to mark it complete.</p>
              </div>
              <div className="flex items-center gap-3">
                {completed > 0 && (
                  <button
                    type="button"
                    onClick={clearCompleted}
                    className="rounded-xl px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    Clear completed
                  </button>
                )}
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                  {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="mt-5 flex gap-1 rounded-2xl border border-white/10 bg-slate-950/40 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`filter-btn flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    filter === f
                      ? 'bg-cyan-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {f}
                  {f === 'Active'    && remaining > 0 && (
                    <span className="ml-1.5 rounded-full bg-slate-950/30 px-1.5 py-0.5 text-xs">
                      {remaining}
                    </span>
                  )}
                  {f === 'Completed' && completed > 0 && (
                    <span className="ml-1.5 rounded-full bg-slate-950/30 px-1.5 py-0.5 text-xs">
                      {completed}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Task items */}
            <div className="mt-4 space-y-3">
              {filtered.length === 0 ? (
                <EmptyState filter={filter} />
              ) : (
                filtered.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onRemove={removeTask}
                  />
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

/* ── Sub-components ── */

function TaskRow({ task, onToggle, onRemove }) {
  return (
    <article className="task-row flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4 task-enter">
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        className={`checkbox-btn grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
          task.completed
            ? 'border-cyan-400 bg-cyan-400 text-slate-950 scale-105'
            : 'border-slate-500 bg-transparent text-transparent hover:border-cyan-400/60'
        }`}
      >
        <svg viewBox="0 0 12 10" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1,5 4.5,9 11,1" />
        </svg>
      </button>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-base font-medium transition-all duration-300 ${
            task.completed ? 'text-slate-500 line-through' : 'text-slate-100'
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          <span className="text-xs text-slate-500">
            {task.completed ? 'Completed' : 'In progress'}
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onRemove(task.id)}
        aria-label={`Delete "${task.title}"`}
        className="delete-btn shrink-0 rounded-xl p-2 text-slate-500 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" />
        </svg>
      </button>
    </article>
  );
}

function EmptyState({ filter }) {
  const messages = {
    All:       { icon: '📋', heading: 'No tasks yet',        sub: 'Add your first task using the form on the left.' },
    Active:    { icon: '🎉', heading: 'All done!',           sub: "No active tasks — you're on top of things." },
    Completed: { icon: '⏳', heading: 'Nothing completed',   sub: 'Complete a task to see it here.' },
  };
  const { icon, heading, sub } = messages[filter];
  return (
    <div className="empty-state flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-12 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-base font-medium text-slate-300">{heading}</p>
      <p className="max-w-xs text-sm text-slate-500">{sub}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 min-w-20">
      <div className="text-2xl font-semibold text-white tabular-nums">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
    </div>
  );
}
