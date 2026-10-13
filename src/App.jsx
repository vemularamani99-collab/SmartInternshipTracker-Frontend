import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Button from './components/Button.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Internships from './pages/Internships.jsx';
import About from './pages/About.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import MyApplications from './pages/MyApplications.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageInternships from './pages/ManageInternships.jsx';

import './App.css';

/**
 * 404 Not Found Page Component
 */
function NotFound() {
  return (
    <div className="section container text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '4rem', display: 'block', marginBottom: 'var(--sp-4)' }}>🔍</span>
      <h1 style={{ fontSize: 'var(--fs-4xl)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)', maxWidth: '460px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}


/**
 * Root component — Defines application providers, layout, and client-side routing.
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <div className="app">
            <Navbar />
          <main className="main-content">
            <Routes>
              {/* ── Public Routes ── */}
              <Route path="/" element={<Home />} />
              <Route path="/internships" element={<Internships />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ── Student Protected Routes ── */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <MyApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={<Navigate to="/applications" replace />}
              />

              {/* ── Admin Protected Routes ── */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={<Navigate to="/admin" replace />}
              />
              <Route
                path="/admin/internships"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <ManageInternships />
                  </ProtectedRoute>
                }
              />

              {/* ── Catch-all 404 Route ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AppProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;
