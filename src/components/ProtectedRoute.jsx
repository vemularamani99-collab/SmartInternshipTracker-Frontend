import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

/**
 * ProtectedRoute component — guards routes requiring authentication or specific roles.
 *
 * Props:
 *   children    — component to render if access is permitted
 *   allowedRole — optional ('STUDENT' or 'ADMIN')
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session token is being verified against /api/auth/me
  if (isLoading) {
    return (
      <div
        className="section container text-center"
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <span style={{ fontSize: '2rem' }}>⏳</span>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and store attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // If an Admin accesses the student dashboard or vice-versa, redirect seamlessly
    if (user?.role === 'ADMIN' && location.pathname.startsWith('/dashboard')) {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === 'STUDENT' && location.pathname.startsWith('/admin')) {
      return <Navigate to="/dashboard" replace />;
    }

    // Otherwise render standard clear role guard
    return (
      <div
        className="section container text-center"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--color-white)',
            padding: 'var(--sp-10)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--sp-4)' }}>🚫</span>
          <h2
            style={{
              fontSize: 'var(--fs-2xl)',
              marginBottom: 'var(--sp-3)',
              color: 'var(--color-text)',
            }}
          >
            Access Restricted
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)' }}>
            This page is only accessible to <strong>{allowedRole}</strong> accounts. You are currently logged in as a <strong>{user?.role}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                (window.location.href = user?.role === 'ADMIN' ? '/admin' : '/dashboard')
              }
            >
              Go to Your Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
