import { useMemo, useState } from 'react';

const initialTasks = [
  { id: 1, title: 'Plan sprint tasks', completed: true, priority: 'High' },
  { id: 2, title: 'Review design mockups', completed: false, priority: 'Medium' },
  { id: 3, title: 'Prepare release notes', completed: false, priority: 'Low' },
];

const priorityStyles = {
  High: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
};

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      remaining: tasks.length - completed,
    };
  }, [tasks]);

  function addTask(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      { id: Date.now(), title: trimmed, completed: false, priority },
      ...current,
    ]);
    setTitle('');
    setPriority('Medium');
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function removeTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
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
              <Stat label="Total" value={stats.total} />
              <Stat label="Done" value={stats.completed} />
              <Stat label="Open" value={stats.remaining} />
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={addTask}
            className="h-fit rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30"
          >
            <h2 className="text-xl font-semibold">Add a task</h2>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Task title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Finalize onboarding checklist"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Priority</span>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Add task
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Task list</h2>
                <p className="mt-1 text-sm text-slate-400">Click a task to mark it complete.</p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                {tasks.length} tasks
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:bg-white/8"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`grid h-6 w-6 place-items-center rounded-full border transition ${
                      task.completed
                        ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                        : 'border-slate-500 bg-transparent text-transparent'
                    }`}
                    aria-label={`Mark ${task.title} complete`}
                  >
                    ✓
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-base font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                      {task.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-slate-500">
                        {task.completed ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 min-w-20">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
    </div>
  );
}