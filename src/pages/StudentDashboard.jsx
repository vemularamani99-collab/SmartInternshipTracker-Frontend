import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/Button.jsx';
import './StudentDashboard.css';

/**
 * Student Dashboard — Live overview page for logged-in students.
 *
 * Connected directly to Spring Boot backend:
 *   - Applications from GET /api/applications/my
 *   - Internships from GET /api/internships
 *
 * Metrics & Content:
 *   - All metrics are calculated dynamically from live API data (ZERO hardcoded stats).
 *   - Highlights: Total Applications, Interview Round, Selected / Offers, Applied / Under Review.
 *   - Real-time application list with status badges and notes.
 *   - Recommended unapplied opportunities.
 *   - Loading spinners and error handling.
 */
function StudentDashboard() {
  const { user } = useAuth();
  const {
    applications,
    internships,
    isLoadingApplications,
    isLoadingInternships,
    applicationsError,
    internshipsError,
    fetchApplications,
    fetchInternships,
  } = useApp();

  // Compute live metrics strictly based on real API data
  const stats = useMemo(() => {
    const list = applications || [];
    const total = list.length;
    const applied = list.filter((a) => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW').length;
    const interview = list.filter((a) => a.status === 'INTERVIEW').length;
    const selected = list.filter((a) => a.status === 'SELECTED' || a.status === 'ACCEPTED').length;
    const rejected = list.filter((a) => a.status === 'REJECTED').length;

    return { total, applied, interview, selected, rejected };
  }, [applications]);

  // Recommended opportunities: active internships the student has not yet applied to
  const recommended = useMemo(() => {
    if (!internships || !Array.isArray(internships)) return [];
    const appliedIds = new Set((applications || []).map((a) => a.internshipId));
    return internships.filter((item) => !appliedIds.has(item.id)).slice(0, 4);
  }, [internships, applications]);

  const isLoading = isLoadingApplications || isLoadingInternships;
  const hasError = applicationsError || internshipsError;

  return (
    <div className="student-dashboard">
      <div className="container">
        {/* ── Welcome Header ── */}
        <section className="dashboard-welcome">
          <div className="dashboard-welcome__text">
            <span className="dashboard-welcome__badge">Student Portal</span>
            <h1 className="dashboard-welcome__title">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="dashboard-welcome__sub">
              {user?.college || 'National Institute of Technology'} • {user?.degree || 'B.Tech Computer Science'}
              {user?.graduationYear ? ` (Class of ${user.graduationYear})` : ''}
            </p>
          </div>
          <div className="dashboard-welcome__actions">
            <Link to="/internships">
              <Button variant="primary" size="md">
                Browse New Internships 🔍
              </Button>
            </Link>
            <Link to="/applications">
              <Button variant="outline" size="md">
                Track Applications 📋
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Error Banner (if API fails) ── */}
        {hasError && (
          <div
            className="dashboard-card"
            style={{
              background: '#fee2e2',
              borderColor: '#fca5a5',
              color: '#991b1b',
              marginBottom: 'var(--sp-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <strong>Sync Warning:</strong> {applicationsError || internshipsError}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchApplications();
                fetchInternships();
              }}
            >
              Retry Sync
            </Button>
          </div>
        )}

        {/* ── Loading Skeleton / Spinner ── */}
        {isLoading && (!applications || applications.length === 0) ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--sp-16) 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--sp-3)',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>⏳</span>
            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Retrieving live student metrics from database...
            </p>
          </div>
        ) : (
          <>
            {/* ── Real Metric Cards ── */}
            <section className="dashboard-stats-grid">
              <div className="stat-card stat-card--purple">
                <div className="stat-card__icon">📨</div>
                <div className="stat-card__info">
                  <span className="stat-card__value">{stats.total}</span>
                  <span className="stat-card__label">Total Applications</span>
                </div>
              </div>

              <div className="stat-card stat-card--amber">
                <div className="stat-card__icon">🎙️</div>
                <div className="stat-card__info">
                  <span className="stat-card__value">{stats.interview}</span>
                  <span className="stat-card__label">Interview Rounds</span>
                </div>
              </div>

              <div className="stat-card stat-card--green">
                <div className="stat-card__icon">🎉</div>
                <div className="stat-card__info">
                  <span className="stat-card__value">{stats.selected}</span>
                  <span className="stat-card__label">Offers Received</span>
                </div>
              </div>

              <div className="stat-card stat-card--gray">
                <div className="stat-card__icon">⏳</div>
                <div className="stat-card__info">
                  <span className="stat-card__value">{stats.applied}</span>
                  <span className="stat-card__label">Awaiting Review</span>
                </div>
              </div>
            </section>

            {/* ── Main Content Grid ── */}
            <div className="dashboard-content-grid">
              {/* Left Column: Recent Applications */}
              <div className="dashboard-card">
                <div className="dashboard-card__header">
                  <div>
                    <h2 className="dashboard-card__title">Recent Applications</h2>
                    <p className="dashboard-card__sub">
                      Live status tracking from backend database records.
                    </p>
                  </div>
                  <Link to="/applications" className="dashboard-card__view-all">
                    Full tracker ({(applications || []).length}) →
                  </Link>
                </div>

                {applications && applications.length > 0 ? (
                  <div className="recent-apps-list">
                    {applications.slice(0, 4).map((app) => (
                      <div key={app.id} className="recent-app-item">
                        <div className="recent-app-item__main">
                          <div className="recent-app-item__role">
                            <strong>{app.title}</strong>
                            <span className="recent-app-item__company">{app.company}</span>
                          </div>
                          <div className="recent-app-item__meta">
                            <span>📅 Applied {app.appliedDate}</span>
                            <span>💰 {app.stipend ? `₹${Number(app.stipend).toLocaleString('en-IN')}/mo` : 'Unpaid'}</span>
                          </div>
                          {(app.feedback || app.notes) && (
                            <p className="recent-app-item__feedback">
                              <em>{app.feedback ? `Update: ${app.feedback}` : `Note: ${app.notes}`}</em>
                            </p>
                          )}
                        </div>

                        <div className="recent-app-item__status">
                          <span
                            className={`status-badge ${
                              app.status === 'SELECTED' || app.status === 'ACCEPTED'
                                ? 'status-badge--selected'
                                : app.status === 'INTERVIEW'
                                ? 'status-badge--interview'
                                : app.status === 'REJECTED'
                                ? 'status-badge--rejected'
                                : 'status-badge--applied'
                            }`}
                          >
                            {app.status === 'SELECTED' || app.status === 'ACCEPTED'
                              ? '🎉 SELECTED'
                              : app.status === 'INTERVIEW'
                              ? '🎙️ INTERVIEW'
                              : app.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">
                    <span className="dashboard-empty__icon">📭</span>
                    <h3>No applications yet</h3>
                    <p>You haven&apos;t added any internship applications to your tracker.</p>
                    <Link to="/internships">
                      <Button variant="primary" size="sm">
                        Find Your First Internship 🚀
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Column: Recommended Opportunities & Profile Summary */}
              <div className="dashboard-card">
                <div className="dashboard-card__header">
                  <div>
                    <h2 className="dashboard-card__title">Recommended for You</h2>
                    <p className="dashboard-card__sub">
                      Listings you haven&apos;t applied to yet.
                    </p>
                  </div>
                  <Link to="/internships" className="dashboard-card__view-all">
                    Explore All ({(internships || []).length}) →
                  </Link>
                </div>

                {recommended.length > 0 ? (
                  <div className="recommended-list">
                    {recommended.map((item) => (
                      <div key={item.id} className="recommended-item">
                        <div className="recommended-item__header">
                          <span className="recommended-item__logo">{item.logo || '💼'}</span>
                          <div>
                            <h4 className="recommended-item__title">{item.title}</h4>
                            <p className="recommended-item__company">
                              {item.company} • {item.location}
                            </p>
                          </div>
                        </div>
                        <div className="recommended-item__footer">
                          <span className="recommended-item__stipend">
                            {item.stipend ? `₹${Number(item.stipend).toLocaleString('en-IN')}/mo` : 'Performance based'}
                          </span>
                          <Link to="/internships">
                            <Button variant="outline" size="sm">
                              View Role
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-6) 0', color: 'var(--color-text-secondary)' }}>
                    <span>✨</span>
                    <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-sm)' }}>
                      You have applied to all available listings! Check back soon for new openings.
                    </p>
                  </div>
                )}

                {/* Profile Quick Summary Card */}
                <div className="student-profile-mini">
                  <h4>Student Profile Summary</h4>
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>College:</strong> {user?.college || 'Not specified'}</p>
                  <p><strong>Degree:</strong> {user?.degree || 'Not specified'}</p>
                  <p><strong>Graduation:</strong> {user?.graduationYear || '2026'}</p>
                  <p>
                    <strong>Role:</strong>{' '}
                    <span className="navbar__role-tag navbar__role-tag--student">STUDENT</span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
