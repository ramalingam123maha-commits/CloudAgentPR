import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the global fetch
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockReset();
  localStorage.clear();
});

describe('Library Management System - Frontend', () => {
  describe('Login Page', () => {
    it('renders the login page with sign in form by default', () => {
      render(<App />);
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      // Both the tab and submit button have "Sign In" label — verify at least one exists
      expect(screen.getAllByRole('button', { name: /Sign In/i }).length).toBeGreaterThanOrEqual(1);
    });

    it('shows demo accounts section on login tab', () => {
      render(<App />);
      expect(screen.getByText(/Demo Accounts/i)).toBeInTheDocument();
      expect(screen.getByText('alice@library.com')).toBeInTheDocument();
      expect(screen.getByText('bob@library.com')).toBeInTheDocument();
    });

    it('switches to register form when Register tab is clicked', () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
      expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });

    it('fills in credentials when demo account card is clicked', () => {
      render(<App />);
      fireEvent.click(screen.getByText('alice@library.com').closest('button'));
      expect(screen.getByLabelText(/Email Address/i).value).toBe('alice@library.com');
      expect(screen.getByLabelText(/Password/i).value).toBe('password123');
    });

    it('shows error message on failed login', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      render(<App />);
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'wrong@email.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'wrongpass' },
      });
      fireEvent.click(screen.getAllByRole('button', { name: /Sign In/i })[1]);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
      });
    });

    it('navigates to books page on successful login', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Alice', email: 'alice@library.com', role: 'admin' },
        }),
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ books: [], total: 0 }),
      });

      render(<App />);
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'alice@library.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getAllByRole('button', { name: /Sign In/i })[1]);

      await waitFor(() => {
        expect(screen.getByText(/Book Catalog/i)).toBeInTheDocument();
      });
    });
  });

  describe('Books Page', () => {
    const mockUser = { id: 1, name: 'Alice', email: 'alice@library.com', role: 'admin' };

    beforeEach(() => {
      localStorage.setItem('lms_user', JSON.stringify(mockUser));
      localStorage.setItem('lms_token', 'mock-token');
    });

    const mockBooks = [
      {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        year: 1925,
        pages: 180,
        description: 'A story of decadence.',
        available: true,
      },
      {
        id: 2,
        title: '1984',
        author: 'George Orwell',
        genre: 'Science Fiction',
        year: 1949,
        pages: 328,
        description: 'A dystopian masterpiece.',
        available: false,
      },
    ];

    it('renders books page with navbar and catalog title', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ books: mockBooks, total: 2 }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Book Catalog/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/LibraryMS/i)).toBeInTheDocument();
    });

    it('displays book cards with title and author', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ books: mockBooks, total: 2 }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
        expect(screen.getByText('1984')).toBeInTheDocument();
      });

      expect(screen.getByText(/F\. Scott Fitzgerald/i)).toBeInTheDocument();
      expect(screen.getByText(/George Orwell/i)).toBeInTheDocument();
    });

    it('shows stats row with total, available, checked-out counts', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ books: mockBooks, total: 2 }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Checked Out')).toBeInTheDocument();
      });
    });

    it('shows Add Book button for admin users', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ books: mockBooks, total: 2 }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/\+ Add Book/i)).toBeInTheDocument();
      });
    });

    it('shows empty state when no books are found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ books: [], total: 0 }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/No books match/i)).toBeInTheDocument();
      });
    });

    it('signs out and returns to login page on logout', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ books: mockBooks, total: 2 }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Sign Out'));

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });
  });
});
