// SearchBar.jsx - Simple search component

export function SearchBar({ value, onChange }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search notes..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
