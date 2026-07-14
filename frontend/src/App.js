import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import BooksPage from './pages/BooksPage';

function AppRouter() {
  const { user } = useAuth();
  return user ? <BooksPage /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
