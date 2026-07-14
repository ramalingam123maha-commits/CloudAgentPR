const request = require('supertest');
const app = require('../src/app');
const booksStore = require('../src/data/books');

let adminToken;
let userToken;

beforeAll(async () => {
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@library.com', password: 'password123' });
  adminToken = adminRes.body.token;

  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'bob@library.com', password: 'reader456' });
  userToken = userRes.body.token;
});

beforeEach(() => {
  booksStore.reset();
});

describe('Books API', () => {
  // ─── GET /api/books ──────────────────────────────────────────────────────────
  describe('GET /api/books', () => {
    it('returns a list of books for authenticated user', async () => {
      const res = await request(app)
        .get('/api/books')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('books');
      expect(Array.isArray(res.body.books)).toBe(true);
      expect(res.body).toHaveProperty('total');
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/books');
      expect(res.status).toBe(401);
    });

    it('filters books by search query (title)', async () => {
      const res = await request(app)
        .get('/api/books?search=gatsby')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.books.length).toBeGreaterThan(0);
      expect(res.body.books[0].title).toMatch(/gatsby/i);
    });

    it('filters books by search query (author)', async () => {
      const res = await request(app)
        .get('/api/books?search=orwell')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.books[0].author).toMatch(/orwell/i);
    });

    it('filters books by genre', async () => {
      const res = await request(app)
        .get('/api/books?genre=Classic')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      res.body.books.forEach((b) => expect(b.genre).toBe('Classic'));
    });

    it('filters books by availability=true', async () => {
      const res = await request(app)
        .get('/api/books?available=true')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      res.body.books.forEach((b) => expect(b.available).toBe(true));
    });

    it('returns all books when no filters are applied', async () => {
      const res = await request(app)
        .get('/api/books')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBeGreaterThan(0);
    });
  });

  // ─── GET /api/books/:id ──────────────────────────────────────────────────────
  describe('GET /api/books/:id', () => {
    it('returns a single book by ID', async () => {
      const res = await request(app)
        .get('/api/books/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.book).toHaveProperty('id', 1);
      expect(res.body.book).toHaveProperty('title');
    });

    it('returns 404 for non-existent book ID', async () => {
      const res = await request(app)
        .get('/api/books/9999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/books/1');
      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/books ─────────────────────────────────────────────────────────
  describe('POST /api/books', () => {
    const newBook = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      genre: 'Non-Fiction',
      year: 2008,
      pages: 431,
      description: 'A handbook of agile software craftsmanship.',
      available: true,
    };

    it('admin can create a new book', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newBook);

      expect(res.status).toBe(201);
      expect(res.body.book).toHaveProperty('id');
      expect(res.body.book.title).toBe('Clean Code');
    });

    it('new book defaults available to true when omitted', async () => {
      const { available: _a, ...bookWithoutAvailable } = newBook;
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookWithoutAvailable);

      expect(res.status).toBe(201);
      expect(res.body.book.available).toBe(true);
    });

    it('regular user cannot create a book (403)', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newBook);

      expect(res.status).toBe(403);
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ author: 'Someone' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when author is missing', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'No Author' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).post('/api/books').send(newBook);
      expect(res.status).toBe(401);
    });
  });

  // ─── PATCH /api/books/:id ────────────────────────────────────────────────────
  describe('PATCH /api/books/:id', () => {
    it('admin can update book availability', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ available: false });

      expect(res.status).toBe(200);
      expect(res.body.book).toHaveProperty('id', 1);
      expect(res.body.book.available).toBe(false);
    });

    it('admin can update book title and author', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title', author: 'Updated Author' });

      expect(res.status).toBe(200);
      expect(res.body.book.title).toBe('Updated Title');
      expect(res.body.book.author).toBe('Updated Author');
    });

    it('regular user cannot update a book (403)', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ available: false });

      expect(res.status).toBe(403);
    });

    it('returns 404 when updating non-existent book', async () => {
      const res = await request(app)
        .patch('/api/books/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ available: false });

      expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .send({ available: false });

      expect(res.status).toBe(401);
    });
  });

  // ─── DELETE /api/books/:id ───────────────────────────────────────────────────
  describe('DELETE /api/books/:id', () => {
    it('admin can delete a book', async () => {
      const res = await request(app)
        .delete('/api/books/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('deleted book is no longer retrievable', async () => {
      await request(app)
        .delete('/api/books/1')
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app)
        .get('/api/books/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('regular user cannot delete a book (403)', async () => {
      const res = await request(app)
        .delete('/api/books/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('returns 404 when deleting non-existent book', async () => {
      const res = await request(app)
        .delete('/api/books/9999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).delete('/api/books/1');
      expect(res.status).toBe(401);
    });
  });
});
