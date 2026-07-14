const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('returns a JWT token on valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@library.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('alice@library.com');
      expect(res.body.user.role).toBe('admin');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('returns a JWT token for regular user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bob@library.com', password: 'reader456' });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('user');
    });

    it('returns 401 on invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@library.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('returns 401 on unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@test.com', password: 'password' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'test' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@library.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Charlie', email: `charlie${Date.now()}@test.com`, password: 'securepass' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.name).toBe('Charlie');
      expect(res.body.user.role).toBe('user');
    });

    it('returns 409 when email already registered', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice Duplicate', email: 'alice@library.com', password: 'pass' });

      expect(res.status).toBe(409);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'nophone@test.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
