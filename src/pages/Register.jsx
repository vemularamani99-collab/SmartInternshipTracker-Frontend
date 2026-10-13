import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import './Login.css';

/**
 * Register Page — Registers new students with the Spring Boot backend.
 *
 * Security Note:
 *   - Public registration strictly assigns the STUDENT role on the server.
 *   - Passwords are encrypted using BCrypt on the backend.
 *   - Validates password length and password confirmation.
 */
function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: '',
    graduationYear: 2026,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side input validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 2. Call real backend registration API (POST /api/auth/register)
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        college: formData.college,
        degree: formData.degree,
        graduationYear: formData.graduationYear,
      });

      if (result.success) {
        // Clear passwords immediately from component state
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        setSuccess('Registration successful! Redirecting to your student dashboard...');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 800);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Unable to reach registration server. Is the backend running on port 8080?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__wrapper">
        {/* ── Left Side: Decorative Panel ── */}
        <div className="login-page__side">
          <div className="login-page__side-content">
            <span className="login-page__side-icon">🚀</span>
            <h2>Create Student Account</h2>
            <p>
              Join the Smart Internship Tracker to discover curated listings, apply in one click, and track hiring decisions.
            </p>

            <div className="login-page__disclaimer-card">
              <span className="login-page__disclaimer-badge">Secure Student Portal</span>
              <p>
                All student accounts are protected by Spring Security. Passwords are encrypted with <strong>BCrypt</strong> and signed with <strong>JWT</strong> tokens.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Side: Register Form ── */}
        <div className="login-page__form-area">
          <div className="login-page__form-box">
            <h1 className="login-page__title">Get Started</h1>
            <p className="login-page__subtitle">
              Create a free student account to begin tracking your applications.
            </p>

            {error && <div className="login-form__alert">{error}</div>}
            {success && (
              <div
                className="login-form__alert"
                style={{ background: '#dcfce7', borderColor: '#86efac', color: '#166534' }}
              >
                {success}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="login-form__group">
                <label htmlFor="name" className="login-form__label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="login-form__input"
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Email */}
              <div className="login-form__group">
                <label htmlFor="email" className="login-form__label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="login-form__input"
                  placeholder="name@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* College & Degree */}
              <div className="login-form-grid-2col">
                <div className="login-form__group">
                  <label htmlFor="college" className="login-form__label">
                    College / University
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    className="login-form__input"
                    placeholder="e.g. NIT / Tech University"
                    value={formData.college}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="login-form__group">
                  <label htmlFor="degree" className="login-form__label">
                    Degree / Branch
                  </label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    className="login-form__input"
                    placeholder="e.g. B.Tech CSE"
                    value={formData.degree}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-form__group">
                <label htmlFor="password" className="login-form__label">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="login-form__input"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div className="login-form__group">
                <label htmlFor="confirmPassword" className="login-form__label">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="login-form__input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                {isSubmitting ? 'Creating Account...' : 'Register as Student'}
              </Button>
            </form>

            <p className="login-page__toggle">
              Already have an account?{' '}
              <Link to="/login" className="login-page__link">
                Sign In
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

export default Register;
