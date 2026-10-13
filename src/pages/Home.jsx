import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Home.css';

/**
 * Home page — The landing page visitors see first.
 *
 * Sections:
 *   1. Hero     — headline, subtitle, CTA buttons
 *   2. Stats    — key platform numbers
 *   3. Featured — top 3 internship cards from live state
 *   4. How it Works — 3-step process cards
 *   5. CTA      — final call-to-action banner
 */
function Home() {
  const { internships } = useApp();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Show the first 3 internships as "featured"
  const featured = internships.slice(0, 3);

  return (
    <div className="home">
      {/* ══════ Hero ══════ */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <span className="hero__badge">🚀 Your Career Starts Here</span>
            <h1 className="hero__title">
              Find & Track Your
              <span className="hero__highlight"> Dream Internship</span>
            </h1>
            <p className="hero__subtitle">
              Browse top internship opportunities, submit applications with a single click,
              and track your progress in real-time — all in one beautifully simple platform.
            </p>
            <div className="hero__actions">
              <Link to="/internships">
                <Button variant="primary" size="lg">
                  Browse Internships 🔍
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to={isAdmin ? '/admin' : '/dashboard'}>
                  <Button variant="outline" size="lg">
                    Go to Your Dashboard →
                  </Button>
                </Link>
              ) : (
                <Link to="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Decorative illustration area */}
          <div className="hero__visual">
            <div className="hero__card hero__card--1">
              <span>📊</span>
              <div>
                <strong>Application Sent</strong>
                <small>Google — Frontend Intern</small>
              </div>
            </div>
            <div className="hero__card hero__card--2">
              <span>✅</span>
              <div>
                <strong>Accepted!</strong>
                <small>Microsoft — Backend Intern</small>
              </div>
            </div>
            <div className="hero__card hero__card--3">
              <span>🔔</span>
              <div>
                <strong>New Listing Posted</strong>
                <small>Amazon — Data Science</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Stats ══════ */}
      <section className="stats section-alt">
        <div className="container">
          <div className="stats__grid">
            <div className="stat">
              <span className="stat__number">500+</span>
              <span className="stat__label">Internships Listed</span>
            </div>
            <div className="stat">
              <span className="stat__number">1,200+</span>
              <span className="stat__label">Students Registered</span>
            </div>
            <div className="stat">
              <span className="stat__number">95%</span>
              <span className="stat__label">Satisfaction Rate</span>
            </div>
            <div className="stat">
              <span className="stat__number">50+</span>
              <span className="stat__label">Partner Companies</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Featured Internships ══════ */}
      <section className="section">
        <div className="container text-center">
          <h2 className="section-title">Featured Internships</h2>
          <p className="section-subtitle">
            Hand-picked opportunities from top companies — updated daily.
          </p>
          <div className="home__featured-grid">
            {featured.map((item) => (
              <InternshipCard
                key={item.id}
                internship={item}
                userRole={user?.role}
                onApply={() => navigate('/internships')}
                onViewDetails={() => navigate('/internships')}
              />
            ))}
          </div>
          <div className="home__view-all">
            <Link to="/internships">
              <Button variant="outline" size="md">
                View All {internships.length} Internships →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ How It Works ══════ */}
      <section className="section-alt">
        <div className="container text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Three simple steps to land your next internship.
          </p>
          <div className="steps__grid">
            <div className="step-card">
              <div className="step-card__number">1</div>
              <div className="step-card__icon">📝</div>
              <h3 className="step-card__title">Create Account</h3>
              <p className="step-card__desc">
                Sign up for free as a student or administrator. It takes less than a minute.
              </p>
            </div>
            <div className="step-card">
              <div className="step-card__number">2</div>
              <div className="step-card__icon">🔍</div>
              <h3 className="step-card__title">Browse & Apply</h3>
              <p className="step-card__desc">
                Explore listings, filter by skills, and submit your application with one click.
              </p>
            </div>
            <div className="step-card">
              <div className="step-card__number">3</div>
              <div className="step-card__icon">📊</div>
              <h3 className="step-card__title">Track Progress</h3>
              <p className="step-card__desc">
                Monitor review milestones and offers in real-time from your student dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CTA Banner ══════ */}
      <section className="cta-banner section">
        <div className="container text-center">
          <div className="cta-banner__box">
            <h2 className="cta-banner__title">Ready to Start Your Career?</h2>
            <p className="cta-banner__subtitle">
              Join thousands of students who found their dream internship through InternTracker.
            </p>
            {isAuthenticated ? (
              <Link to={isAdmin ? '/admin' : '/dashboard'}>
                <Button variant="primary" size="lg">
                  Open Your Dashboard →
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Get Started — It&apos;s Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
