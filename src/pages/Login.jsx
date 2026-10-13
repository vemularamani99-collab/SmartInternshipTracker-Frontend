import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import './Login.css';

/**
 * Login Page — Authenticates students and administrators against the Spring Boot API.
 *
 * Features:
 *   - Real JWT authentication via POST /api/auth/login
 *   - Loading states and disabled buttons during in-flight network requests
 *   - Server error banner for invalid credentials or connection issues
 *   - Notice when redirected due to session expiration
 *   - Quick demo credentials for viva/testing against real backend
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginAsStudent, loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user was redirected due to an expired token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Your previous session has expired. Please sign in again.');
    }
  }, [location.search]);

  // Destination route after login
  const from = location.state?.from?.pathname;

  const handleLoginSuccess = (user) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (user.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        // Clear password from component memory immediately after successful login
        setPassword('');
        handleLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Unable to reach authentication server. Is the backend running on port 8080?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStudentLogin = async () => {
    setIsSubmitting(true);
    setError('');
    setEmail('student@example.com');
    setPassword('password123');
    setRole('STUDENT');

    const result = await loginAsStudent();
    setIsSubmitting(false);
    if (result.success) {
      setPassword('');
      handleLoginSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  const handleQuickAdminLogin = async () => {
    setIsSubmitting(true);
    setError('');
    setEmail('admin@example.com');
    setPassword('Admin@Secure2026');
    setRole('ADMIN');

    const result = await loginAsAdmin();
    setIsSubmitting(false);
    if (result.success) {
      setPassword('');
      handleLoginSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__wrapper">
        {/* ── Left Side: Brand Panel ── */}
        <div className="login-page__side">
          <div className="login-page__side-content">
            <span className="login-page__side-icon">🎯</span>
            <h2>Smart Internship Tracker</h2>
            <p>
              Your centralised platform to discover internships, submit applications, and track decisions in real-time.
            </p>

            <div className="login-page__disclaimer-card">
              <span className="login-page__disclaimer-badge">Spring Security + JWT</span>
              <p>
                Connected to live Spring Boot REST API. Passwords are encrypted with <strong>BCrypt</strong>, and sessions are secured with signed <strong>JSON Web Tokens</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Side: Login Form ── */}
        <div className="login-page__form-area">
          <div className="login-page__form-box">
            <h1 className="login-page__title">Sign In</h1>
            <p className="login-page__subtitle">
              Enter your credentials to access your dashboard.
            </p>

            {/* Quick Demo Shortcuts */}
            <div className="demo-shortcuts">
              <span className="demo-shortcuts__label">⚡ Quick Demo Login:</span>
              <div className="demo-shortcuts__buttons">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleQuickStudentLogin}
                  className="demo-btn demo-btn--student"
                >
                  🎓 Demo Student
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleQuickAdminLogin}
                  className="demo-btn demo-btn--admin"
                >
                  🛡️ Demo Admin
                </Button>
              </div>
            </div>

            <div className="login-page__divider">
              <span>or sign in with email</span>
            </div>

            {error && <div className="login-form__alert">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Role Toggle Selector */}
              <div className="login-form__group">
                <label className="login-form__label">Sign in as:</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-selector__btn ${role === 'STUDENT' ? 'role-selector__btn--active' : ''}`}
                    onClick={() => {
                      setRole('STUDENT');
                      if (email === 'admin@example.com') setEmail('');
                    }}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    className={`role-selector__btn ${role === 'ADMIN' ? 'role-selector__btn--active' : ''}`}
                    onClick={() => {
                      setRole('ADMIN');
                      if (email === 'student@example.com') setEmail('');
                    }}
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="login-form__group">
                <label htmlFor="email" className="login-form__label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="login-form__input"
                  placeholder={role === 'ADMIN' ? 'admin@example.com' : 'student@example.com'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Password */}
              <div className="login-form__group">
                <label htmlFor="password" className="login-form__label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="login-form__input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isSubmitting}
                className="login-form__submit"
              >
                {isSubmitting ? 'Authenticating...' : `Sign In as ${role === 'ADMIN' ? 'Admin' : 'Student'}`}
              </Button>
            </form>

            <p className="login-page__toggle">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="login-page__link">
                Register here
              </Link>
            </p>

            <p className="login-page__back">
              <Link to="/">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
