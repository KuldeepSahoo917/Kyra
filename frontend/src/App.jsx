import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import Profile from './pages/Profile';

// Layout
import MainLayout from './components/layout/MainLayout';
import Toast from './components/ui/Toast';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Private Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="projects/:projectId" element={<ProjectView />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toast />
    </>
  );
}

export default App;
