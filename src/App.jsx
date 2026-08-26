// Main application component for the Task Manager
// Manages task state, form inputs, and renders the complete UI with a two-column layout
// Features: add tasks, mark complete/incomplete, delete tasks, and view real-time stats

import { useMemo, useState } from 'react';

// Initial tasks loaded on app start - demonstrates pre-populated data
// Each task has: unique id, title text, completion status, and priority level
const initialTasks = [
  { id: 1, title: 'Plan sprint tasks', completed: true, priority: 'High' },
  { id: 2, title: 'Review design mockups', completed: false, priority: 'Medium' },
  { id: 3, title: 'Prepare release notes', completed: false, priority: 'Low' },
];

// Maps priority levels to Tailwind CSS classes for color-coded priority badges
// High = rose/red, Medium = amber/yellow, Low = emerald/green
// Uses semantic background and text colors with subtle ring borders
const priorityStyles = {
  High: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
};

export default function App() {
  // Local state for the task list - core of the app's functionality
  const [tasks, setTasks] = useState(initialTasks);
  // Input field value for the task title being typed into the form
  const [title, setTitle] = useState('');
  // Dropdown selection for the priority of a new task (defaults to Medium)
  const [priority, setPriority] = useState('Medium');

  // Derived statistics recalculated only when tasks array changes
  // Prevents unnecessary recalculation on unrelated state updates
  // Returns: total count, completed count, and remaining (open) count
  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      remaining: tasks.length - completed,
    };
  }, [tasks]);

  // Handles form submission when user clicks "Add task" button
  // Validates title (rejects empty/whitespace), prepends new task to list, resets form
  // Uses Date.now() as a unique ID (sufficient for client-side demo)
  function addTask(event) {
    event.preventDefault();
    const trimmed = title.trim();
    // Guard clause: do nothing if title is empty after trimming whitespace
    if (!trimmed) return;
    // Prepend new task (newest at top) with current form values
    setTasks((current) => [
      { id: Date.now(), title: trimmed, completed: false, priority },
      ...current,
    ]);
    // Clear form fields for the next task entry
    setTitle('');
    setPriority('Medium');
  }

  // Toggles the completed state of a task by its ID
  // Uses functional state update to avoid stale closure issues
  // Finds matching task and flips its completed boolean, leaves others unchanged
  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  // Removes a task from the list by ID
  // Uses filter to create new array excluding the deleted task
  function removeTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    // Full-page container with dark gradient background from Tailwind
    // Provides visual hierarchy with dark slate tones
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* ──────────────────────────────────────────────────────────────────
            HEADER / STATS SECTION
            Displays title, description, and three key metrics (Total/Done/Open)
            ────────────────────────────────────────────────────────────────── */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              {/* Category badge indicating the app type */}
              <span className="inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
                Task management app
              </span>
              <div>
                {/* Main headline */}
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Organize work with clarity.
                </h1>
                {/* Sub-headline with secondary description */}
                <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
                  Capture tasks, assign priorities, and keep track of progress in one clean dashboard.
                </p>
              </div>
            </div>

            {/* Three stat cards displaying real-time counts */}
            {/* Layout changes: column on mobile, row on larger screens */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Total" value={stats.total} />
              <Stat label="Done" value={stats.completed} />
              <Stat label="Open" value={stats.remaining} />
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            MAIN CONTENT: TWO-COLUMN LAYOUT
            Left: "Add task" form with inputs and submit button
            Right: Scrollable list of task cards with toggle/delete controls
            ────────────────────────────────────────────────────────────────── */}
        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* ADD TASK FORM PANEL */}
          {/* Fixed-width sidebar on larger screens, full-width on mobile */}
          <form
            onSubmit={addTask}
            className="h-fit rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30"
          >
            <h2 className="text-xl font-semibold">Add a task</h2>
            <div className="mt-5 space-y-4">
              {/* Task title input field */}
              {/* Controlled component: value synced to state via onChange */}
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Task title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Finalize onboarding checklist"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>

              {/* Priority level selector dropdown */}
              {/* Controlled component with three fixed options */}
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

              {/* Submit button */}
              {/* Triggers addTask() via form's onSubmit handler */}
              {/* Form validation (empty title check) happens in addTask() */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Add task
              </button>
            </div>
          </form>

          {/* TASK LIST PANEL */}
          {/* Main content area showing all tasks with controls */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
            {/* Header with title and live task count */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Task list</h2>
                <p className="mt-1 text-sm text-slate-400">Click a task to mark it complete.</p>
              </div>
              {/* Live counter showing current number of tasks */}
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                {tasks.length} tasks
              </span>
            </div>

            {/* Scrollable grid of task cards */}
            {/* Empty state: naturally shows no items if tasks array is empty */}
            <div className="mt-6 space-y-3">
              {tasks.map((task) => (
                // Task card container
                // Hover effect improves interactivity feedback
                <article
                  key={task.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:bg-white/8"
                >
                  {/* Toggle completion button */}
                  {/* Visual feedback: filled cyan when done, outlined when pending */}
                  {/* Accessibility: aria-label describes action for screen readers */}
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

                  {/* Task title and metadata section */}
                  <div className="min-w-0 flex-1">
                    {/* Task title */}
                    {/* Strikes through and mutes text color when completed */}
                    {/* truncate class prevents overflow on long titles */}
                    <p className={`truncate text-base font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                      {task.title}
                    </p>
                    {/* Metadata row: priority badge + status label */}
                    <div className="mt-2 flex items-center gap-2">
                      {/* Priority badge */}
                      {/* Color-coded using priorityStyles map defined above */}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                      {/* Status label showing completion state */}
                      <span className="text-xs text-slate-500">
                        {task.completed ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  {/* Removes the task from state permanently */}
                  {/* Rose/red hover color signals destructive action */}
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

// Reusable stat card component
// Used in the header to display key metrics (Total, Done, Open)
// Displays a large numeric value with a descriptive label beneath
function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 min-w-20">
      {/* Large numeric display */}
      <div className="text-2xl font-semibold text-white">{value}</div>
      {/* Small label in uppercase */}
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
    </div>
  );
}
