const request = require('supertest');
const app = require('../src/app');
const booksStore = require('../src/data/books');

let adminToken;
let userToken;

beforeAll(async () => {
  // Obtain admin token
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@library.com', password: 'password123' });
  adminToken = adminRes.body.token;

  // Obtain regular user token
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'bob@library.com', password: 'reader456' });
  userToken = userRes.body.token;
});

beforeEach(() => {
  booksStore.reset();
});

describe('Books API', () => {
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

    it('filters books by search query', async () => {
      const res = await request(app)
        .get('/api/books?search=gatsby')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.books.length).toBeGreaterThan(0);
      expect(res.body.books[0].title).toMatch(/gatsby/i);
    });

    it('filters books by genre', async () => {
      const res = await request(app)
        .get('/api/books?genre=Classic')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      res.body.books.forEach((b) => expect(b.genre).toBe('Classic'));
    });

    it('filters books by availability', async () => {
      const res = await request(app)
        .get('/api/books?available=true')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      res.body.books.forEach((b) => expect(b.available).toBe(true));
    });
  });

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
  });

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

    it('returns 401 without authentication', async () => {
      const res = await request(app).post('/api/books').send(newBook);
      expect(res.status).toBe(401);
    });
  });
});
