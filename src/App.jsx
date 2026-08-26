import { useState } from 'react';
import { AddNoteForm } from './components/AddNoteForm';
import { SearchBar } from './components/SearchBar';
import { NoteCard } from './components/NoteCard';
import { NOTE_COLORS, INITIAL_NOTES } from './constants';

// Main App Component
export default function App() {
  // State: all notes in the app
  const [notes, setNotes] = useState(INITIAL_NOTES);

  // State: current search query
  const [search, setSearch] = useState('');

  // State: which note is being deleted (for confirmation)
  const [deletingNote, setDeletingNote] = useState(null);

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    const searchQuery = search.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchQuery) ||
      note.body.toLowerCase().includes(searchQuery)
    );
  });

  // Add a new note to the list
  const handleAddNote = (noteData) => {
    const newNote = {
      id: Date.now(), // Simple unique ID using timestamp
      ...noteData,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]); // Add to beginning
  };

  // Delete or cancel delete of a note
  const handleDelete = (noteId, confirm) => {
    if (confirm === true) {
      // User confirmed deletion
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setDeletingNote(null);
    } else if (confirm === false) {
      // User cancelled deletion
      setDeletingNote(null);
    } else {
      // Show delete confirmation
      setDeletingNote(noteId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 My Notes</h1>
          <p className="text-gray-600">Capture every thought. {notes.length} notes so far.</p>
        </header>

        {/* Main Content: Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Add Note Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <AddNoteForm onAdd={handleAddNote} colors={NOTE_COLORS} />
            </div>
          </div>

          {/* Right Column: Notes List */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <SearchBar value={search} onChange={setSearch} />

            {/* Empty State */}
            {filteredNotes.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-xl font-semibold text-gray-600 mb-2">
                  {search ? '🔍 No notes found' : '📭 No notes yet'}
                </p>
                <p className="text-gray-500">
                  {search
                    ? 'Try searching with different keywords'
                    : 'Create your first note using the form on the left'}
                </p>
              </div>
            )}

            {/* Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={
                    deletingNote === note.id
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  }
                >
                  <NoteCard
                    note={{
                      ...note,
                      isDeleting: deletingNote === note.id,
                    }}
                    onDelete={handleDelete}
                    colors={NOTE_COLORS}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
