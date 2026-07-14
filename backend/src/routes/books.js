const express = require('express');
const { authenticate } = require('../middleware/auth');
const booksStore = require('../data/books');

const router = express.Router();

// GET /api/books — list all books with optional filters
router.get('/', authenticate, (req, res) => {
  const { search, genre, available } = req.query;
  const books = booksStore.getFiltered({ search, genre, available });
  res.json({ books, total: books.length });
});

// GET /api/books/:id — get single book
router.get('/:id', authenticate, (req, res) => {
  const book = booksStore.getById(Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json({ book });
});

// POST /api/books — create a book (admin only)
router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { title, author, genre, year, pages, description, available } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const book = booksStore.create({
    title,
    author,
    genre: genre || 'Fiction',
    year: year || new Date().getFullYear(),
    pages: pages || 0,
    description: description || '',
    available: available !== undefined ? Boolean(available) : true,
  });

  res.status(201).json({ book });
});

// PATCH /api/books/:id — update a book (admin only)
router.patch('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const id = Number(req.params.id);
  const { title, author, genre, year, pages, description, available } = req.body;

  const allowedUpdates = {};
  if (title !== undefined) allowedUpdates.title = title;
  if (author !== undefined) allowedUpdates.author = author;
  if (genre !== undefined) allowedUpdates.genre = genre;
  if (year !== undefined) allowedUpdates.year = year;
  if (pages !== undefined) allowedUpdates.pages = pages;
  if (description !== undefined) allowedUpdates.description = description;
  if (available !== undefined) allowedUpdates.available = Boolean(available);

  const updated = booksStore.update(id, allowedUpdates);
  if (!updated) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.json({ book: updated });
});

// DELETE /api/books/:id — delete a book (admin only)
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const id = Number(req.params.id);
  const removed = booksStore.remove(id);
  if (!removed) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.json({ message: 'Book deleted successfully' });
});

module.exports = router;

