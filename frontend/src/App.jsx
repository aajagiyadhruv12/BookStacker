import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import AdminPage from './pages/AdminPage';
import AddBook from './pages/AddBook';
import Profile from './pages/profile';
import MyLoans from './pages/MyLoans';
import MyReservations from './pages/MyReservations';
import UserDetail from './pages/UserDetail';

import QRScanner from './pages/QRScanner';

const App = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Determine redirection based on role
  const getDashboardPath = () => {
    if (!user || !userData) return "/login";
    return userData.role === 'admin' ? "/admin/users" : "/dashboard";
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to={getDashboardPath()} />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={getDashboardPath()} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={getDashboardPath()} />} />
          <Route path="/dashboard" element={user ? (userData?.role === 'admin' ? <Navigate to="/admin/users" /> : <Dashboard />) : <Navigate to="/login" />} />
          <Route path="/books" element={user ? <BookList /> : <Navigate to="/login" />} />
          <Route path="/books/:id" element={user ? <BookDetail /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/my-loans" element={user ? <MyLoans /> : <Navigate to="/login" />} />
          <Route path="/my-reservations" element={user ? <MyReservations /> : <Navigate to="/login" />} />
          <Route path="/admin/users" element={user && userData?.role === 'admin' ? <AdminPage /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/users/:userId" element={user && userData?.role === 'admin' ? <UserDetail /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/add-book" element={user && userData?.role === 'admin' ? <AddBook /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/scanner" element={user && userData?.role === 'admin' ? <QRScanner /> : <Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
