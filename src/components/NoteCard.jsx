// NoteCard.jsx - Displays a single note with delete functionality

export function NoteCard({ note, onDelete, colors }) {
  const colorClass = colors.find((c) => c.key === note.color);
  const isDeleting = note.isDeleting;

  // Format date in a readable way (e.g., "Jan 10, 2024")
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClass.bg} ${colorClass.border}`}>
      {/* Show delete confirmation or note content */}
      {isDeleting ? (
        <div className="text-center space-y-3">
          <p className="text-sm font-medium">Delete this note?</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onDelete(note.id, true)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => onDelete(note.id, false)}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Note content */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg">{note.title}</h3>
            <button
              onClick={() => onDelete(note.id, null)}
              className="text-red-500 hover:bg-red-100 p-1 rounded"
              title="Delete note"
            >
              ✕
            </button>
          </div>

          {/* Note body text */}
          {note.body && (
            <p className="mt-2 text-gray-700 text-sm line-clamp-4">{note.body}</p>
          )}

          {/* Date created */}
          <p className="mt-3 text-xs text-gray-500">{formattedDate}</p>
        </>
      )}
    </div>
  );
}
