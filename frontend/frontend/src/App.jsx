import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProblemsPage from './pages/ProblemsPage';
import DailyProblemPage from './pages/DailyProblemPage';
import ContestsPage from './pages/ContestsPage';
import MockTestPage from './pages/MockTestPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DiscussionsPage from './pages/DiscussionsPage';
import PrelimsPage from './pages/PrelimsPage';
import ProgressPage from './pages/ProgressPage';
import NewsPage from './pages/NewsPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route 
          path="/daily" 
          element={
            <ProtectedRoute>
              <DailyProblemPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/contests" element={<ContestsPage />} />
        <Route 
          path="/mock-tests" 
          element={
            <ProtectedRoute>
              <MockTestPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/discussions" element={<DiscussionsPage />} />
        <Route path="/prelims" element={<PrelimsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
