import { useState } from 'react';

const initialNotes = [
  {
    id: 1,
    title: 'Welcome to Notes!',
    body: 'This is your personal notes space. Add, read, and delete notes freely.',
    color: 'yellow',
    createdAt: new Date('2024-01-10T09:00:00').toISOString(),
  },
  {
    id: 2,
    title: 'Shopping List',
    body: 'Milk, eggs, bread, butter, coffee beans, and fresh vegetables.',
    color: 'blue',
    createdAt: new Date('2024-01-11T14:30:00').toISOString(),
  },
  {
    id: 3,
    title: 'Ideas',
    body: 'Build a habit tracker. Learn a new language. Read more books this year.',
    color: 'green',
    createdAt: new Date('2024-01-12T08:15:00').toISOString(),
  },
];

const NOTE_COLORS = [
  { key: 'yellow', label: 'Yellow', bg: 'bg-amber-400/15', border: 'border-amber-400/30', dot: 'bg-amber-400' },
  { key: 'blue',   label: 'Blue',   bg: 'bg-cyan-400/15',  border: 'border-cyan-400/30',  dot: 'bg-cyan-400'  },
  { key: 'green',  label: 'Green',  bg: 'bg-emerald-400/15', border: 'border-emerald-400/30', dot: 'bg-emerald-400' },
  { key: 'pink',   label: 'Pink',   bg: 'bg-pink-400/15',  border: 'border-pink-400/30',  dot: 'bg-pink-400'  },
  { key: 'purple', label: 'Purple', bg: 'bg-violet-400/15', border: 'border-violet-400/30', dot: 'bg-violet-400' },
];

function getColorClasses(colorKey) {
  return NOTE_COLORS.find((c) => c.key === colorKey) || NOTE_COLORS[0];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function App() {
  const [notes, setNotes] = useState(initialNotes);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState('yellow');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
  });

  function addNote(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle && !trimmedBody) return;
    setNotes((prev) => [
      {
        id: Date.now(),
        title: trimmedTitle || 'Untitled',
        body: trimmedBody,
        color,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setTitle('');
    setBody('');
    setColor('yellow');
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setConfirmDelete(null);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-300 ring-1 ring-inset ring-amber-400/20">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                My Notes
              </span>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Capture every thought.
              </h1>
              <p className="mt-2 text-base text-slate-400">
                Jot down ideas, reminders, or anything worth keeping — all in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-center min-w-[80px]">
                <div className="text-3xl font-semibold text-white">{notes.length}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-slate-400">Notes</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">

          {/* Add Note Form */}
          <aside>
            <form
              onSubmit={addNote}
              className="sticky top-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30"
            >
              <h2 className="text-xl font-semibold">New Note</h2>
              <div className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Title</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title…"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Content</span>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your note here…"
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20"
                  />
                </label>

                {/* Color Picker */}
                <div className="space-y-2">
                  <span className="text-sm text-slate-300">Color</span>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setColor(c.key)}
                        title={c.label}
                        className={`h-7 w-7 rounded-full transition-transform ${c.dot} ${
                          color === c.key
                            ? 'scale-125 ring-2 ring-white/60 ring-offset-2 ring-offset-slate-900'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 active:scale-95"
                >
                  Add Note
                </button>
              </div>
            </form>
          </aside>

          {/* Notes List */}
          <section className="space-y-5">
            {/* Search */}
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3 pl-11 pr-4 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/15"
              />
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/40 py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-slate-400">
                  {search ? 'No notes match your search.' : 'No notes yet.'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {search ? 'Try a different keyword.' : 'Add your first note using the form.'}
                </p>
              </div>
            )}

            {/* Notes Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((note) => {
                const c = getColorClasses(note.color);
                return (
                  <article
                    key={note.id}
                    className={`group relative flex flex-col rounded-3xl border p-5 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${c.bg} ${c.border}`}
                  >
                    {/* Delete button */}
                    {confirmDelete === note.id ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-slate-950/80 backdrop-blur-sm px-6 text-center">
                        <p className="text-sm font-medium text-slate-200">Delete this note?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(note.id)}
                        aria-label="Delete note"
                        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 rounded-xl p-1.5 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}

                    <h3 className="pr-8 text-base font-semibold text-slate-100 leading-snug">{note.title}</h3>
                    {note.body && (
                      <p className="mt-2 flex-1 text-sm text-slate-300 leading-relaxed line-clamp-5">{note.body}</p>
                    )}
                    <p className="mt-4 text-xs text-slate-500">{formatDate(note.createdAt)}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
