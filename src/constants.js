// constants.js - Colors and other constants

export const NOTE_COLORS = [
  { key: 'yellow', label: 'Yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  { key: 'blue',   label: 'Blue',   bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-400'   },
  { key: 'green',  label: 'Green',  bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-400'  },
  { key: 'pink',   label: 'Pink',   bg: 'bg-pink-50',   border: 'border-pink-200',   dot: 'bg-pink-400'   },
  { key: 'purple', label: 'Purple', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-400' },
];

// Sample notes to show when app first loads
export const INITIAL_NOTES = [
  {
    id: 1,
    title: 'Welcome to Notes!',
    body: 'This is your personal notes app. You can add, search, and delete notes.',
    color: 'yellow',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Shopping List',
    body: 'Milk, eggs, bread, butter, and cheese',
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
];
