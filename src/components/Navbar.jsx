import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import Button from './Button.jsx';
import './Navbar.css';

/**
 * Navbar component — Adaptive navigation for Guests, Students, and Admins.
 *
 * State:
 *   - menuOpen: controls mobile drawer toggle
 *   - Reads authenticated user & role from useAuth()
 */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent, isAdmin, logout } = useAuth();
  const { isBackendConnected } = useApp();

  /** Checks if a nav link matches the current route */
  const isActive = (path) => location.pathname === path;

  /** Close mobile menu when a link is clicked */
  const handleLinkClick = () => setMenuOpen(false);

  /** Handle user logout */
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <nav className="navbar__inner container">
        {/* ── Brand ── */}
        <Link to="/" className="navbar__brand" onClick={handleLinkClick}>
          <span className="navbar__brand-icon">🎯</span>
          <span className="navbar__brand-text">InternTracker</span>
          <span
            className="navbar__status-pill"
            title={
              isBackendConnected
                ? 'Spring Boot Backend Connected (Port 8080)'
                : 'Offline Demo Mode — Start Spring Boot backend on port 8080 for live DB storage'
            }
          >
            {isBackendConnected ? '🟢 Live API' : '⚡ Demo Mode'}
          </span>
        </Link>

        {/* ── Navigation Links ── */}
        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {/* Always visible */}
          <li>
            <Link
              to="/"
              className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}
              onClick={handleLinkClick}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/internships"
              className={`navbar__link ${isActive('/internships') ? 'navbar__link--active' : ''}`}
              onClick={handleLinkClick}
            >
              Browse Internships
            </Link>
          </li>

          {/* Student-only Links */}
          {isAuthenticated && isStudent && (
            <>
              <li>
                <Link
                  to="/applications"
                  className={`navbar__link ${isActive('/applications') ? 'navbar__link--active' : ''}`}
                  onClick={handleLinkClick}
                >
                  My Applications
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
                  onClick={handleLinkClick}
                >
                  Dashboard
                </Link>
              </li>
            </>
          )}

          {/* Admin-only Links */}
          {isAuthenticated && isAdmin && (
            <>
              <li>
                <Link
                  to="/admin"
                  className={`navbar__link ${isActive('/admin') ? 'navbar__link--active' : ''}`}
                  onClick={handleLinkClick}
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/internships"
                  className={`navbar__link ${isActive('/admin/internships') ? 'navbar__link--active' : ''}`}
                  onClick={handleLinkClick}
                >
                  Manage Internships
                </Link>
              </li>
            </>
          )}

          {/* Guest or Public Links */}
          {!isAuthenticated && (
            <li>
              <Link
                to="/about"
                className={`navbar__link ${isActive('/about') ? 'navbar__link--active' : ''}`}
                onClick={handleLinkClick}
              >
                About
              </Link>
            </li>
          )}

          {/* ── Auth CTA / User Profile Badge ── */}
          {isAuthenticated ? (
            <li className="navbar__user-section">
              <div className="navbar__user-badge">
                <span className="navbar__user-role-icon">
                  {isAdmin ? '🛡️' : '🎓'}
                </span>
                <span className="navbar__user-name">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <span className={`navbar__role-tag navbar__role-tag--${user?.role?.toLowerCase()}`}>
                  {user?.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="navbar__logout-btn"
              >
                Logout
              </Button>
            </li>
          ) : (
            <li className="navbar__guest-actions">
              <Link to="/login" onClick={handleLinkClick}>
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={handleLinkClick}>
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </li>
          )}
        </ul>

        {/* ── Mobile Hamburger ── */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
