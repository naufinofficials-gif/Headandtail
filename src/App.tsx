import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { initDB, sessionDB, usersDB } from './lib/db';
import { ToastContainer } from './components/Toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import HistoryPage from './pages/HistoryPage';
import InstallGuide from './pages/InstallGuide';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppContent() {
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    initDB();
    const session = sessionDB.get();
    if (session) {
      const user = usersDB.getById(session.userId);
      if (user) {
        useAuthStore.setState({ user });
      } else {
        sessionDB.clear();
      }
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/login" element={<><Navbar /><LoginPage /></>} />
        <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
        <Route path="/install-guide" element={<><Navbar /><InstallGuide /></>} />

        {/* Admin */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* User Protected */}
        <Route path="/game" element={
          <ProtectedRoute>
            <Navbar />
            <GamePage />
          </ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute>
            <Navbar />
            <DepositPage />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute>
            <Navbar />
            <WithdrawPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <Navbar />
            <HistoryPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
