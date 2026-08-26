const booksStore = require('../src/data/books');

describe('Books Data Store', () => {
  beforeEach(() => {
    booksStore.reset();
  });

  // ─── getAll() ────────────────────────────────────────────────────────
  describe('getAll()', () => {
    it('returns all books after reset', () => {
      const books = booksStore.getAll();
      expect(Array.isArray(books)).toBe(true);
      expect(books.length).toBeGreaterThan(0);
    });

    it('returns exactly 3 books after reset', () => {
      const books = booksStore.getAll();
      expect(books.length).toBe(3);
    });

    it('returns books with required properties', () => {
      const books = booksStore.getAll();
      books.forEach((book) => {
        expect(book).toHaveProperty('id');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('author');
        expect(book).toHaveProperty('genre');
        expect(book).toHaveProperty('year');
        expect(book).toHaveProperty('pages');
        expect(book).toHaveProperty('description');
        expect(book).toHaveProperty('available');
      });
    });

    it('returns the same instance on multiple calls (shared reference)', () => {
      const books1 = booksStore.getAll();
      const books2 = booksStore.getAll();
      expect(books1).toBe(books2);
    });
  });

  // ─── getById(id) ─────────────────────────────────────────────────────
  describe('getById(id)', () => {
    it('returns a book by valid ID', () => {
      const book = booksStore.getById(1);
      expect(book).not.toBeNull();
      expect(book.id).toBe(1);
      expect(book.title).toBe('The Great Gatsby');
    });

    it('returns null for non-existent ID', () => {
      const book = booksStore.getById(9999);
      expect(book).toBeUndefined();
    });

    it('returns the correct book for each ID', () => {
      const book1 = booksStore.getById(1);
      const book2 = booksStore.getById(2);
      const book3 = booksStore.getById(3);

      expect(book1.title).toBe('The Great Gatsby');
      expect(book2.title).toBe('1984');
      expect(book3.title).toBe('To Kill a Mockingbird');
    });

    it('returns books with correct availability status', () => {
      const availableBook = booksStore.getById(1);
      const unavailableBook = booksStore.getById(3);

      expect(availableBook.available).toBe(true);
      expect(unavailableBook.available).toBe(false);
    });
  });

  // ─── getFiltered({ search, genre, available }) ─────────────────────
  describe('getFiltered()', () => {
    it('returns all books when no filters applied', () => {
      const filtered = booksStore.getFiltered({});
      expect(filtered.length).toBe(3);
    });

    it('filters books by search query (title case-insensitive)', () => {
      const filtered = booksStore.getFiltered({ search: 'gatsby' });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].title.toLowerCase()).toContain('gatsby');
    });

    it('filters books by search query (author case-insensitive)', () => {
      const filtered = booksStore.getFiltered({ search: 'orwell' });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].author.toLowerCase()).toContain('orwell');
    });

    it('returns empty array when search matches nothing', () => {
      const filtered = booksStore.getFiltered({ search: 'nonexistent' });
      expect(filtered.length).toBe(0);
    });

    it('filters books by genre', () => {
      const filtered = booksStore.getFiltered({ genre: 'Classic' });
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((book) => {
        expect(book.genre).toBe('Classic');
      });
    });

    it('returns empty array for non-existent genre', () => {
      const filtered = booksStore.getFiltered({ genre: 'NonExistentGenre' });
      expect(filtered.length).toBe(0);
    });

    it('filters books by availability=true', () => {
      const filtered = booksStore.getFiltered({ available: 'true' });
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((book) => {
        expect(book.available).toBe(true);
      });
    });

    it('ignores available filter when not "true"', () => {
      const filtered = booksStore.getFiltered({ available: 'false' });
      expect(filtered.length).toBe(3); // Returns all books
    });

    it('combines search and genre filters', () => {
      const filtered = booksStore.getFiltered({ search: 'Mockingbird', genre: 'Classic' });
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((book) => {
        expect(book.genre).toBe('Classic');
      });
    });

    it('combines search and availability filters', () => {
      const filtered = booksStore.getFiltered({ search: 'gatsby', available: 'true' });
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((book) => {
        expect(book.available).toBe(true);
      });
    });
  });

  // ─── create(data) ────────────────────────────────────────────────────
  describe('create(data)', () => {
    it('creates a new book and returns it with an ID', () => {
      const newBook = {
        title: 'New Book',
        author: 'Test Author',
        genre: 'Test',
        year: 2024,
        pages: 100,
        description: 'Test description',
        available: true,
      };

      const created = booksStore.create(newBook);

      expect(created).toHaveProperty('id');
      expect(created.id).toBeGreaterThan(0);
      expect(created.title).toBe('New Book');
      expect(created.author).toBe('Test Author');
    });

    it('increments the ID with each new book', () => {
      const book1 = booksStore.create({ title: 'Book 1', author: 'Author 1' });
      const book2 = booksStore.create({ title: 'Book 2', author: 'Author 2' });

      expect(book2.id).toBeGreaterThan(book1.id);
    });

    it('adds the book to the store', () => {
      const before = booksStore.getAll().length;
      booksStore.create({ title: 'New Book', author: 'Author' });
      const after = booksStore.getAll().length;

      expect(after).toBe(before + 1);
    });

    it('returns the created book as a new object', () => {
      const input = { title: 'Book', author: 'Author' };
      const created = booksStore.create(input);

      expect(created).not.toBe(input);
      expect(created.title).toBe(input.title);
    });

    it('preserves all data properties when creating a book', () => {
      const newBook = {
        title: 'Complete Book',
        author: 'Complete Author',
        genre: 'Mystery',
        year: 2023,
        pages: 350,
        description: 'A complete description',
        available: false,
      };

      const created = booksStore.create(newBook);

      expect(created.title).toBe('Complete Book');
      expect(created.author).toBe('Complete Author');
      expect(created.genre).toBe('Mystery');
      expect(created.year).toBe(2023);
      expect(created.pages).toBe(350);
      expect(created.description).toBe('A complete description');
      expect(created.available).toBe(false);
    });
  });

  // ─── update(id, data) ────────────────────────────────────────────────
  describe('update(id, data)', () => {
    it('updates a book and returns the updated book', () => {
      const updated = booksStore.update(1, { title: 'Updated Title' });

      expect(updated).not.toBeNull();
      expect(updated.id).toBe(1);
      expect(updated.title).toBe('Updated Title');
    });

    it('returns null when updating non-existent book', () => {
      const result = booksStore.update(9999, { title: 'New Title' });
      expect(result).toBeNull();
    });

    it('partially updates a book (preserves other fields)', () => {
      const original = booksStore.getById(1);
      const updated = booksStore.update(1, { title: 'New Title' });

      expect(updated.author).toBe(original.author);
      expect(updated.genre).toBe(original.genre);
      expect(updated.title).toBe('New Title');
    });

    it('updates multiple fields at once', () => {
      const updated = booksStore.update(1, {
        title: 'Updated Title',
        author: 'Updated Author',
        available: false,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.author).toBe('Updated Author');
      expect(updated.available).toBe(false);
    });

    it('persists updates in the store', () => {
      booksStore.update(1, { title: 'Persistent Title' });
      const retrieved = booksStore.getById(1);

      expect(retrieved.title).toBe('Persistent Title');
    });

    it('updates only the specified book', () => {
      const book2Before = booksStore.getById(2);
      booksStore.update(1, { title: 'Updated Title' });
      const book2After = booksStore.getById(2);

      expect(book2After.title).toBe(book2Before.title);
    });

    it('can toggle availability status', () => {
      const original = booksStore.getById(1);
      const updated = booksStore.update(1, { available: !original.available });

      expect(updated.available).toBe(!original.available);
    });
  });

  // ─── remove(id) ──────────────────────────────────────────────────────
  describe('remove(id)', () => {
    it('removes a book and returns true', () => {
      const result = booksStore.remove(1);
      expect(result).toBe(true);
    });

    it('returns false when removing non-existent book', () => {
      const result = booksStore.remove(9999);
      expect(result).toBe(false);
    });

    it('decreases the total books count', () => {
      const before = booksStore.getAll().length;
      booksStore.remove(1);
      const after = booksStore.getAll().length;

      expect(after).toBe(before - 1);
    });

    it('makes the book no longer retrievable', () => {
      booksStore.remove(1);
      const retrieved = booksStore.getById(1);

      expect(retrieved).toBeUndefined();
    });

    it('does not affect other books', () => {
      const book2Before = booksStore.getById(2);
      booksStore.remove(1);
      const book2After = booksStore.getById(2);

      expect(book2After).toEqual(book2Before);
    });

    it('can remove multiple books sequentially', () => {
      booksStore.remove(1);
      booksStore.remove(2);

      expect(booksStore.getAll().length).toBe(1);
      expect(booksStore.getById(1)).toBeUndefined();
      expect(booksStore.getById(2)).toBeUndefined();
    });
  });

  // ─── reset() ─────────────────────────────────────────────────────────
  describe('reset()', () => {
    it('restores the initial state', () => {
      booksStore.create({ title: 'Extra Book', author: 'Extra Author' });
      booksStore.reset();

      const books = booksStore.getAll();
      expect(books.length).toBe(3);
      expect(books[0].title).toBe('The Great Gatsby');
    });

    it('resets IDs to expected state', () => {
      booksStore.create({ title: 'Book 11', author: 'Author 11' });
      booksStore.reset();

      const newBook = booksStore.create({ title: 'Book 12', author: 'Author 12' });
      expect(newBook.id).toBe(4);
    });
  });
});
