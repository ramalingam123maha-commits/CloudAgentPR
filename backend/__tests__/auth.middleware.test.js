const jwt = require('jsonwebtoken');
const { authenticate, JWT_SECRET } = require('../src/middleware/auth');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  // ─── authenticate() ──────────────────────────────────────────────────
  describe('authenticate()', () => {
    it('calls next() when valid token is provided', () => {
      const user = { id: 1, email: 'test@test.com', role: 'user' };
      const token = jwt.sign(user, JWT_SECRET);

      req.headers.authorization = `Bearer ${token}`;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toHaveProperty('id', 1);
      expect(req.user).toHaveProperty('email', 'test@test.com');
      expect(req.user).toHaveProperty('role', 'user');
    });

    it('returns 401 when no Authorization header is provided', () => {
      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when Authorization header does not start with Bearer', () => {
      req.headers.authorization = 'Basic sometoken';

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', () => {
      req.headers.authorization = 'Bearer invalidtoken123';

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token is expired', () => {
      const user = { id: 1, email: 'test@test.com', role: 'user' };
      const expiredToken = jwt.sign(user, JWT_SECRET, { expiresIn: '-1s' });

      req.headers.authorization = `Bearer ${expiredToken}`;

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('attaches user data to req.user when token is valid', () => {
      const user = { id: 42, email: 'alice@example.com', role: 'admin', name: 'Alice' };
      const token = jwt.sign(user, JWT_SECRET);

      req.headers.authorization = `Bearer ${token}`;

      authenticate(req, res, next);

      expect(req.user.id).toBe(42);
      expect(req.user.email).toBe('alice@example.com');
      expect(req.user.role).toBe('admin');
      expect(req.user.name).toBe('Alice');
    });

    it('extracts token correctly from Bearer scheme', () => {
      const user = { id: 1, email: 'test@test.com' };
      const token = jwt.sign(user, JWT_SECRET);

      req.headers.authorization = `Bearer ${token}`;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user.email).toBe('test@test.com');
    });

    it('handles multiple spaces in Authorization header correctly', () => {
      const user = { id: 1, email: 'test@test.com' };
      const token = jwt.sign(user, JWT_SECRET);

      req.headers.authorization = `Bearer  ${token}`;

      authenticate(req, res, next);

      // Should handle the extra space gracefully
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('preserves the original req object properties', () => {
      const user = { id: 1, email: 'test@test.com' };
      const token = jwt.sign(user, JWT_SECRET);

      req.headers.authorization = `Bearer ${token}`;
      req.method = 'GET';
      req.path = '/api/books';

      authenticate(req, res, next);

      expect(req.method).toBe('GET');
      expect(req.path).toBe('/api/books');
    });
  });

  // ─── JWT_SECRET ──────────────────────────────────────────────────────
  describe('JWT_SECRET', () => {
    it('is defined and is a string', () => {
      expect(JWT_SECRET).toBeDefined();
      expect(typeof JWT_SECRET).toBe('string');
    });

    it('uses environment variable or default secret', () => {
      // The secret is either from process.env.JWT_SECRET or a default
      expect(JWT_SECRET).toBe(
        process.env.JWT_SECRET || 'library_secret_key_2024'
      );
    });

    it('can be used to verify tokens', () => {
      const payload = { id: 1, email: 'test@test.com' };
      const token = jwt.sign(payload, JWT_SECRET);

      expect(() => jwt.verify(token, JWT_SECRET)).not.toThrow();
      const verified = jwt.verify(token, JWT_SECRET);
      expect(verified).toHaveProperty('id', 1);
      expect(verified).toHaveProperty('email', 'test@test.com');
    });

    it('cannot verify tokens signed with different secrets', () => {
      const payload = { id: 1, email: 'test@test.com' };
      const differentSecret = 'different_secret_key';
      const token = jwt.sign(payload, differentSecret);

      expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
    });
  });
});
