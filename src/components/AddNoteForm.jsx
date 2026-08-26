// AddNoteForm.jsx - Form to create a new note

export function AddNoteForm({ onAdd, colors }) {
  // Simple form that takes title, body, and color
  const handleSubmit = (e) => {
    e.preventDefault();

    // Get form values
    const formData = new FormData(e.target);
    const title = formData.get('title').trim();
    const body = formData.get('body').trim();
    const color = formData.get('color');

    // Don't add empty notes
    if (!title && !body) return;

    // Call parent function to add note
    onAdd({
      title: title || 'Untitled',
      body,
      color,
    });

    // Clear form
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">Create New Note</h2>

      {/* Title input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          placeholder="Enter note title..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Note content input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          name="body"
          placeholder="Write your note here..."
          rows={5}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {colors.map((color) => (
            <label key={color.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color.key}
                defaultChecked={color.key === 'yellow'}
                className="hidden"
              />
              <div
                className={`w-6 h-6 rounded-full ${color.dot} border-2 border-gray-300`}
                title={color.label}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600"
      >
        Add Note
      </button>
    </form>
  );
}
