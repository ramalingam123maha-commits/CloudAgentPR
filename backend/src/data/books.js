// In-memory books store
let books = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic',
    year: 1925,
    pages: 180,
    description: 'A portrayal of the Jazz Age set in Long Island amid wealthy characters who love wealth, high life, and illusions.',
    available: true,
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    genre: 'Science Fiction',
    year: 1949,
    pages: 328,
    description: 'A dystopian social science fiction novel following Winston Smith who works for the Party rewriting history.',
    available: true,
  },
  {
    id: 3,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Classic',
    year: 1960,
    pages: 281,
    description: "A Pulitzer Prize-winning novel of a young girl's awakening to racial injustice in the American South.",
    available: false,
  },
  {
    id: 4,
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J. K. Rowling',
    genre: 'Fantasy',
    year: 1997,
    pages: 223,
    description: 'The beginning of the magical journey of young wizard Harry Potter and his friends at Hogwarts.',
    available: true,
  },
  {
    id: 5,
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    year: 1965,
    pages: 412,
    description: 'An epic science fiction novel set in a distant future amid a feudal interstellar society.',
    available: true,
  },
  {
    id: 6,
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    genre: 'Science',
    year: 1988,
    pages: 212,
    description: 'A landmark volume in science writing, exploring the nature of space, time, black holes, and the Big Bang.',
    available: true,
  },
  {
    id: 7,
    title: 'The Hobbit',
    author: 'J. R. R. Tolkien',
    genre: 'Fantasy',
    year: 1937,
    pages: 310,
    description: 'A classic fantasy tale of Bilbo Baggins who is swept into an epic quest to reclaim the Lonely Mountain.',
    available: false,
  },
  {
    id: 8,
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    genre: 'Non-Fiction',
    year: 2011,
    pages: 443,
    description: 'Explores the history and impact of Homo sapiens on the world from the Stone Age to modern day.',
    available: true,
  },
  {
    id: 9,
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    genre: 'Mystery',
    year: 2003,
    pages: 454,
    description: 'A thriller following Robert Langdon as he uncovers a mystery hidden within the world\'s greatest works of art.',
    available: true,
  },
  {
    id: 10,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Classic',
    year: 1813,
    pages: 432,
    description: 'A romantic novel that charts the emotional development of Elizabeth Bennet and Mr. Darcy.',
    available: true,
  },
];

let nextId = books.length + 1;

function getAll() {
  return books;
}

function getById(id) {
  return books.find((b) => b.id === id);
}

function getFiltered({ search, genre, available } = {}) {
  let result = [...books];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }

  if (genre) {
    result = result.filter((b) => b.genre === genre);
  }

  if (available === 'true') {
    result = result.filter((b) => b.available === true);
  }

  return result;
}

function create(data) {
  const book = { id: nextId++, ...data };
  books.push(book);
  return book;
}

// Expose reset for tests
function reset() {
  books = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Classic',
      year: 1925,
      pages: 180,
      description: 'A portrayal of the Jazz Age set in Long Island.',
      available: true,
    },
    {
      id: 2,
      title: '1984',
      author: 'George Orwell',
      genre: 'Science Fiction',
      year: 1949,
      pages: 328,
      description: 'A dystopian social science fiction novel.',
      available: true,
    },
    {
      id: 3,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Classic',
      year: 1960,
      pages: 281,
      description: "A Pulitzer Prize-winning novel.",
      available: false,
    },
  ];
  nextId = 4;
}

function update(id, data) {
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  books[idx] = { ...books[idx], ...data };
  return books[idx];
}

function remove(id) {
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  books.splice(idx, 1);
  return true;
}

module.exports = { getAll, getById, getFiltered, create, update, remove, reset };
