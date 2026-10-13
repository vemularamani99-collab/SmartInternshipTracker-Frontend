import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InternshipCard from '../components/InternshipCard.jsx';
import Button from '../components/Button.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Internships.css';

/**
 * Internships Page — Browse, Search, Sort & Paginate Opportunities.
 *
 * Features:
 *   - Real-time search by Title or Company (plus Location and Skills)
 *   - Sorting: Newest, Stipend (High to Low / Low to High), Deadline, Title (A-Z)
 *   - Pagination controls with responsive page buttons
 *   - Accessible modals with ESC key navigation
 *   - Client-side validation for URLs and inputs
 *   - Loading skeleton, server error recovery, and empty states
 */
function Internships() {
  const {
    internships,
    applications,
    isLoadingInternships,
    internshipsError,
    fetchInternships,
    applyToInternship,
  } = useApp();
  const { user, isAuthenticated, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL'); // 'ALL' | 'REMOTE' | 'ON_SITE'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'stipend-high' | 'stipend-low' | 'deadline' | 'title'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [selectedDetails, setSelectedDetails] = useState(null); // For details modal
  const [selectedApply, setSelectedApply] = useState(null); // For apply modal
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Close modals on ESC key for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedDetails(null);
        if (!isSubmitting) setSelectedApply(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationFilter, sortBy, pageSize]);

  // Set of applied internship IDs for the logged-in student
  const appliedInternshipIds = useMemo(() => {
    if (!applications || !Array.isArray(applications)) return new Set();
    return new Set(applications.map((app) => app.internshipId));
  }, [applications]);

  /** 1. Filter logic */
  const filtered = useMemo(() => {
    if (!internships || !Array.isArray(internships)) return [];
    return internships.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q)));

      const isRemote = item.location?.toLowerCase().includes('remote');
      let matchesLocation = true;
      if (locationFilter === 'REMOTE') matchesLocation = isRemote;
      if (locationFilter === 'ON_SITE') matchesLocation = !isRemote;

      return matchesSearch && matchesLocation;
    });
  }, [internships, searchQuery, locationFilter]);

  /** 2. Sorting logic */
  const sortedAndFiltered = useMemo(() => {
    const list = [...filtered];

    if (sortBy === 'stipend-high') {
      list.sort((a, b) => (Number(b.stipend) || 0) - (Number(a.stipend) || 0));
    } else if (sortBy === 'stipend-low') {
      list.sort((a, b) => (Number(a.stipend) || 0) - (Number(b.stipend) || 0));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      // Default: newest first by id or createdAt
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  }, [filtered, sortBy]);

  /** 3. Pagination computation */
  const totalPages = Math.max(1, Math.ceil(sortedAndFiltered.length / pageSize));
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAndFiltered.slice(start, start + pageSize);
  }, [sortedAndFiltered, currentPage, pageSize]);

  /** Open View Details modal */
  const handleViewDetails = (internship) => {
    setSelectedDetails(internship);
  };

  /** Trigger apply flow */
  const handleInitiateApply = (internship) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/internships' } } });
      return;
    }

    if (!isStudent) {
      alert('Administrators cannot apply for student internships.');
      return;
    }

    if (appliedInternshipIds.has(internship.id)) {
      alert('You have already applied for this internship! Check your My Applications page.');
      return;
    }

    setSelectedApply(internship);
    setCoverNote('');
    setResumeUrl(
      user.name
        ? `https://drive.google.com/resumes/${user.name.replace(/\s+/g, '_')}_Resume.pdf`
        : ''
    );
    setApplyError('');
  };

  /** Submit application with frontend URL validation */
  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!selectedApply) return;

    // Frontend URL validation for resume
    if (resumeUrl.trim()) {
      const urlPattern = /^(https?:\/\/).+/i;
      if (!urlPattern.test(resumeUrl.trim())) {
        setApplyError('Resume URL must start with http:// or https://');
        return;
      }
    }

    setIsSubmitting(true);
    setApplyError('');

    const res = await applyToInternship(selectedApply.id, {
      notes: coverNote.trim(),
      resumeUrl: resumeUrl.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      const appliedTitle = selectedApply.title;
      setSelectedApply(null);
      if (selectedDetails && selectedDetails.id === selectedApply.id) {
        setSelectedDetails(null);
      }
      setToastMessage(`Successfully added "${appliedTitle}" to My Applications!`);
      setTimeout(() => setToastMessage(''), 5000);
    } else {
      setApplyError(res.message);
    }
  };

  return (
    <div className="internships-page">
      {/* ── Notification Toast ── */}
      {toastMessage && (
        <div className="internships-toast" role="status" aria-live="polite">
          <span>🎉</span>
          <p>{toastMessage}</p>
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>
            View in My Applications →
          </Button>
        </div>
      )}

      {/* ── Page Header ── */}
      <section className="internships-page__header section-alt">
        <div className="container text-center">
          <span className="hero__badge" style={{ marginBottom: 'var(--sp-3)' }}>
            💼 Live Opportunities
          </span>
          <h1 className="section-title">Explore Internships</h1>
          <p className="section-subtitle">
            Discover roles from top technology companies. Filter by role, company, or technical stack.
          </p>

          {/* ── Search Bar ── */}
          <div className="search-bar">
            <span className="search-bar__icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              aria-label="Search internships by role, company or skills"
              className="search-bar__input"
              placeholder="Search by role title or company name (e.g. Frontend, Google, React)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-bar__clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* ── Location Filter Pills ── */}
          <div className="internships-filters" role="group" aria-label="Filter listings by location">
            <button
              className={`filter-pill ${locationFilter === 'ALL' ? 'filter-pill--active' : ''}`}
              onClick={() => setLocationFilter('ALL')}
            >
              All Listings ({internships.length})
            </button>
            <button
              className={`filter-pill ${locationFilter === 'REMOTE' ? 'filter-pill--active' : ''}`}
              onClick={() => setLocationFilter('REMOTE')}
            >
              🏠 Remote Only
            </button>
            <button
              className={`filter-pill ${locationFilter === 'ON_SITE' ? 'filter-pill--active' : ''}`}
              onClick={() => setLocationFilter('ON_SITE')}
            >
              🏢 On-site & Hybrid
            </button>
          </div>
        </div>
      </section>

      {/* ── Results & Controls Section ── */}
      <section className="section">
        <div className="container">
          {/* Server Error Alert */}
          {internshipsError && (
            <div
              className="dashboard-card"
              role="alert"
              style={{
                background: '#fee2e2',
                borderColor: '#fca5a5',
                color: '#991b1b',
                marginBottom: 'var(--sp-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--sp-3)',
              }}
            >
              <div>
                <strong>Connection Error:</strong> {internshipsError}
              </div>
              <Button variant="outline" size="sm" onClick={fetchInternships}>
                Retry Loading 🔄
              </Button>
            </div>
          )}

          {/* Sorting and Metadata Bar */}
          <div
            className="internships-page__meta-bar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--sp-3)',
              marginBottom: 'var(--sp-6)',
            }}
          >
            <div>
              <p className="internships-page__count" style={{ margin: 0 }}>
                Showing <strong>{sortedAndFiltered.length}</strong> opportunities
                {searchQuery && (
                  <> for &quot;<em>{searchQuery}</em>&quot;</>
                )}
              </p>
              {user && isStudent && (
                <span className="internships-page__applied-summary" style={{ display: 'block', marginTop: '2px' }}>
                  You have applied to {appliedInternshipIds.size} listings
                </span>
              )}
            </div>

            {/* Sorting & Page Size Controls */}
            <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <label htmlFor="sort-select" style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  className="admin-select"
                  style={{ padding: '6px 12px', fontSize: 'var(--fs-xs)' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="stipend-high">Stipend: High to Low</option>
                  <option value="stipend-low">Stipend: Low to High</option>
                  <option value="deadline">Deadline: Soonest</option>
                  <option value="title">Role Title: A to Z</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <label htmlFor="page-size-select" style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Per page:
                </label>
                <select
                  id="page-size-select"
                  className="admin-select"
                  style={{ padding: '6px 10px', fontSize: 'var(--fs-xs)' }}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoadingInternships ? (
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
                Loading live internships from backend...
              </p>
            </div>
          ) : paginatedListings.length > 0 ? (
            <>
              {/* Cards Grid */}
              <div className="internships-page__grid">
                {paginatedListings.map((item) => (
                  <InternshipCard
                    key={item.id}
                    internship={item}
                    onApply={handleInitiateApply}
                    onViewDetails={handleViewDetails}
                    isApplied={appliedInternshipIds.has(item.id)}
                    userRole={user?.role}
                  />
                ))}
              </div>

              {/* ── Pagination Controls ── */}
              {totalPages > 1 && (
                <div
                  className="pagination-controls"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'var(--sp-2)',
                    marginTop: 'var(--sp-12)',
                    flexWrap: 'wrap',
                  }}
                  role="navigation"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    ← Previous
                  </Button>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`filter-pill ${currentPage === pageNum ? 'filter-pill--active' : ''}`}
                        style={{ padding: '6px 12px', minWidth: '36px' }}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="internships-page__empty">
              <span className="internships-page__empty-icon" aria-hidden="true">
                🔎
              </span>
              <h3>No matching internships found</h3>
              <p>Try searching for different keywords or reset your filters.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('ALL');
                  setSortBy('newest');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── View Details Modal ── */}
      {selectedDetails && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-title"
          onClick={() => setSelectedDetails(null)}
        >
          <div
            className="modal-box"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-badge">{selectedDetails.company}</span>
                <h2 id="details-title">{selectedDetails.title}</h2>
                <p className="modal-company">
                  📍 {selectedDetails.location} • 💼 {selectedDetails.internshipType || selectedDetails.duration || 'Full-time Intern'} • 👥 {selectedDetails.openings || 1} Openings
                </p>
              </div>
              <button
                className="modal-close"
                aria-label="Close modal"
                onClick={() => setSelectedDetails(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
              {/* Stipend & Deadline Pills */}
              <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--color-bg-page)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-lg)', flex: 1, border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)', display: 'block' }}>Monthly Stipend</span>
                  <strong style={{ fontSize: 'var(--fs-lg)', color: 'var(--color-success)' }}>
                    {selectedDetails.stipend ? `₹${Number(selectedDetails.stipend).toLocaleString('en-IN')}/mo` : 'Performance based'}
                  </strong>
                </div>
                <div style={{ background: 'var(--color-bg-page)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-lg)', flex: 1, border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)', display: 'block' }}>Application Deadline</span>
                  <strong style={{ fontSize: 'var(--fs-lg)', color: 'var(--color-primary)' }}>
                    {selectedDetails.deadline ? new Date(selectedDetails.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open'}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: 'var(--fs-sm)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-1)' }}>
                  Role Overview
                </h4>
                <p style={{ color: 'var(--color-text)', lineHeight: 1.6, fontSize: 'var(--fs-sm)' }}>
                  {selectedDetails.description}
                </p>
              </div>

              {/* Requirements */}
              {selectedDetails.requirements && (
                <div>
                  <h4 style={{ fontSize: 'var(--fs-sm)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-1)' }}>
                    Candidate Requirements
                  </h4>
                  <p style={{ color: 'var(--color-text)', lineHeight: 1.6, fontSize: 'var(--fs-sm)' }}>
                    {selectedDetails.requirements}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedDetails.tags && selectedDetails.tags.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>
                    Required Technical Skills
                  </h4>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    {selectedDetails.tags.map((tag) => (
                      <span key={tag} className="internship-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Application URL Link */}
              {selectedDetails.applicationUrl && (
                <div style={{ background: 'var(--color-primary-soft)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                    Official Recruitment Portal:
                  </span>
                  <a
                    href={selectedDetails.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="internship-card__external-link"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}
                  >
                    Open Official Link ↗
                  </a>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="modal-actions" style={{ marginTop: 'var(--sp-6)' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedDetails(null)}
              >
                Close
              </Button>
              {appliedInternshipIds.has(selectedDetails.id) ? (
                <Button variant="ghost" size="md" disabled style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                  Already in My Applications ✓
                </Button>
              ) : isStudent ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    const item = selectedDetails;
                    setSelectedDetails(null);
                    handleInitiateApply(item);
                  }}
                >
                  Add to My Applications 🚀
                </Button>
              ) : !isAuthenticated ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setSelectedDetails(null);
                    navigate('/login', { state: { from: { pathname: '/internships' } } });
                  }}
                >
                  Log In to Apply 🚀
                </Button>
              ) : isAdmin ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSelectedDetails(null);
                    navigate('/admin/internships');
                  }}
                >
                  Manage in Admin Console ⚙️
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── Add to Applications Modal ── */}
      {selectedApply && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-modal-title"
          onClick={() => !isSubmitting && setSelectedApply(null)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-badge">Application Submission</span>
                <h2 id="apply-modal-title">Apply for {selectedApply.title}</h2>
                <p className="modal-company">
                  {selectedApply.company} • {selectedApply.location}
                </p>
              </div>
              <button
                className="modal-close"
                aria-label="Close modal"
                disabled={isSubmitting}
                onClick={() => setSelectedApply(null)}
              >
                ✕
              </button>
            </div>

            {applyError && (
              <div
                className="login-form__alert"
                role="alert"
                style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}
              >
                {applyError}
              </div>
            )}

            <form onSubmit={handleConfirmApply} className="modal-form">
              <div className="modal-student-info">
                <strong>Applicant:</strong> {user?.name} ({user?.email})
                <br />
                <small>Institution: {user?.college || 'Computer Science'}</small>
              </div>

              {/* Official application link reminder */}
              {selectedApply.applicationUrl && (
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-page)', padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  ℹ️ This internship has an official careers portal. You can also view or submit directly at:{' '}
                  <a
                    href={selectedApply.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    {selectedApply.company} Careers ↗
                  </a>
                </div>
              )}

              <div className="login-form__group">
                <label htmlFor="resumeUrl" className="login-form__label">
                  Resume Link / Portfolio URL (Optional)
                </label>
                <input
                  type="url"
                  id="resumeUrl"
                  className="login-form__input"
                  placeholder="https://drive.google.com/your-resume"
                  value={resumeUrl}
                  onChange={(e) => {
                    setResumeUrl(e.target.value);
                    if (applyError) setApplyError('');
                  }}
                  disabled={isSubmitting}
                />
                <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                  Must start with http:// or https://
                </small>
              </div>

              <div className="login-form__group">
                <label htmlFor="coverNote" className="login-form__label">
                  Application Notes / Cover Note (Optional)
                </label>
                <textarea
                  id="coverNote"
                  className="login-form__textarea"
                  rows="3"
                  placeholder="Add notes for your tracker (e.g. Applied via official website, referral by senior)..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="modal-actions">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedApply(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting to Tracker...' : 'Add to My Applications 🚀'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Internships;
