import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import BookCard from '../components/BookCard';

// Mock the global fetch
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockReset();
  localStorage.clear();
});

// ─── Shared mock data ──────────────────────────────────────────────────────────
const mockAdminUser = { id: 1, name: 'Alice', email: 'alice@library.com', role: 'admin' };
const mockRegularUser = { id: 2, name: 'Bob', email: 'bob@library.com', role: 'user' };

const mockBooks = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic',
    year: 1925,
    pages: 180,
    description: 'A story of the Jazz Age.',
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

function setupBooksPage(user = mockAdminUser) {
  localStorage.setItem('lms_user', JSON.stringify(user));
  localStorage.setItem('lms_token', 'mock-token');
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ books: mockBooks, total: mockBooks.length }),
  });
}

// ─── Login Page ────────────────────────────────────────────────────────────────
describe('Login Page', () => {
  it('renders sign-in form by default', () => {
    render(<App />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Sign In/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('shows demo accounts on login tab', () => {
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

  it('fills credentials when admin demo account card is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('alice@library.com').closest('button'));
    expect(screen.getByLabelText(/Email Address/i).value).toBe('alice@library.com');
    expect(screen.getByLabelText(/Password/i).value).toBe('password123');
  });

  it('fills credentials when user demo account card is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('bob@library.com').closest('button'));
    expect(screen.getByLabelText(/Email Address/i).value).toBe('bob@library.com');
    expect(screen.getByLabelText(/Password/i).value).toBe('reader456');
  });

  it('shows error alert on failed login', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(<App />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Sign In/i })[1]);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });

  it('navigates to books page on successful login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'tok', user: mockAdminUser }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ books: [], total: 0 }),
    });

    render(<App />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@library.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Sign In/i })[1]);

    await waitFor(() => {
      expect(screen.getByText(/Book Catalog/i)).toBeInTheDocument();
    });
  });

  it('register form submits and navigates to books page', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'tok', user: { id: 3, name: 'Charlie', email: 'charlie@test.com', role: 'user' } }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ books: [], total: 0 }),
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'charlie@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'securepw' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Book Catalog/i)).toBeInTheDocument();
    });
  });

  it('shows register error when email is already taken', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already registered' }),
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice Dup' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@library.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'anything' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already registered');
    });
  });
});

// ─── Books Page ────────────────────────────────────────────────────────────────
describe('Books Page', () => {
  it('renders catalog title and navbar', async () => {
    setupBooksPage();
    render(<App />);

    await waitFor(() => expect(screen.getByText(/Book Catalog/i)).toBeInTheDocument());
    expect(screen.getByText(/LibraryMS/i)).toBeInTheDocument();
  });

  it('displays book cards with title, author and year', async () => {
    setupBooksPage();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
    });
    expect(screen.getByText(/F\. Scott Fitzgerald/i)).toBeInTheDocument();
    expect(screen.getByText(/George Orwell/i)).toBeInTheDocument();
  });

  it('shows stats row: total, available, checked-out', async () => {
    setupBooksPage();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Total Books')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Checked Out')).toBeInTheDocument();
    });
  });

  it('shows "Add Book" button for admin users', async () => {
    setupBooksPage(mockAdminUser);
    render(<App />);

    await waitFor(() => expect(screen.getByText(/\+ Add Book/i)).toBeInTheDocument());
  });

  it('does NOT show "Add Book" button for regular users', async () => {
    setupBooksPage(mockRegularUser);
    render(<App />);

    await waitFor(() => expect(screen.getByText(/Book Catalog/i)).toBeInTheDocument());
    expect(screen.queryByText(/\+ Add Book/i)).not.toBeInTheDocument();
  });

  it('shows empty state when no books match', async () => {
    localStorage.setItem('lms_user', JSON.stringify(mockAdminUser));
    localStorage.setItem('lms_token', 'mock-token');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ books: [], total: 0 }),
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText(/No books match/i)).toBeInTheDocument());
    expect(screen.getByText(/Clear Filters/i)).toBeInTheDocument();
  });

  it('shows error banner when fetch fails', async () => {
    localStorage.setItem('lms_user', JSON.stringify(mockAdminUser));
    localStorage.setItem('lms_token', 'mock-token');
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    render(<App />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('signs out and returns to login page', async () => {
    setupBooksPage();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Sign Out')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => expect(screen.getByText(/Welcome back/i)).toBeInTheDocument());
  });

  it('shows availability badges on book cards', async () => {
    setupBooksPage();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/✓ Available/i)).toBeInTheDocument();
      expect(screen.getByText(/✗ Checked Out/i)).toBeInTheDocument();
    });
  });
});

// ─── BookCard component (unit) ─────────────────────────────────────────────────
describe('BookCard Component', () => {
  const book = {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    genre: 'Non-Fiction',
    year: 2008,
    pages: 431,
    description: 'Agile software craftsmanship.',
    available: true,
  };

  it('renders book title, author, genre and year', () => {
    render(<BookCard book={book} isAdmin={false} />);
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText(/Robert C\. Martin/i)).toBeInTheDocument();
    expect(screen.getByText('Non-Fiction')).toBeInTheDocument();
    expect(screen.getByText(/2008/)).toBeInTheDocument();
  });

  it('shows available badge for available book', () => {
    render(<BookCard book={book} isAdmin={false} />);
    expect(screen.getByText(/✓ Available/i)).toBeInTheDocument();
  });

  it('shows checked-out badge for unavailable book', () => {
    render(<BookCard book={{ ...book, available: false }} isAdmin={false} />);
    expect(screen.getByText(/✗ Checked Out/i)).toBeInTheDocument();
  });

  it('does NOT show admin action buttons for non-admin', () => {
    render(<BookCard book={book} isAdmin={false} />);
    expect(screen.queryByLabelText(/Delete book/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Mark as checked out/i)).not.toBeInTheDocument();
  });

  it('shows admin action buttons when isAdmin is true', () => {
    render(<BookCard book={book} isAdmin={true} token="tok" onDelete={jest.fn()} onUpdate={jest.fn()} />);
    expect(screen.getByLabelText(/Mark as checked out/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Delete book/i)).toBeInTheDocument();
  });

  it('calls onDelete after admin confirms delete', async () => {
    window.confirm = jest.fn(() => true);
    const onDelete = jest.fn();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<BookCard book={book} isAdmin={true} token="tok" onDelete={onDelete} onUpdate={jest.fn()} />);
    fireEvent.click(screen.getByLabelText(/Delete book/i));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
  });

  it('does NOT call onDelete when admin cancels confirm', async () => {
    window.confirm = jest.fn(() => false);
    const onDelete = jest.fn();

    render(<BookCard book={book} isAdmin={true} token="tok" onDelete={onDelete} onUpdate={jest.fn()} />);
    fireEvent.click(screen.getByLabelText(/Delete book/i));

    await waitFor(() => expect(onDelete).not.toHaveBeenCalled());
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls onUpdate when admin toggles availability', async () => {
    const updatedBook = { ...book, available: false };
    const onUpdate = jest.fn();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ book: updatedBook }),
    });

    render(<BookCard book={book} isAdmin={true} token="tok" onDelete={jest.fn()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByLabelText(/Mark as checked out/i));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updatedBook));
  });

  it('shows Return button when book is already checked out', () => {
    render(<BookCard book={{ ...book, available: false }} isAdmin={true} token="tok" onDelete={jest.fn()} onUpdate={jest.fn()} />);
    expect(screen.getByLabelText(/Mark as available/i)).toBeInTheDocument();
  });
});
