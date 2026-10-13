import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/Button.jsx';
import './MyApplications.css';

/**
 * My Applications Page — Real-time application tracker for students.
 *
 * Connected to live Spring Boot REST API:
 *   - GET    /api/applications/my (fetches only the authenticated student's applications)
 *   - PATCH  /api/applications/{id}/status (updates status according to workflow permissions)
 *   - DELETE /api/applications/{id} (withdraws own application)
 *
 * Security & Ownership:
 *   - The server enforces student ownership via JWT; students cannot access another student's applications.
 */
function MyApplications() {
  const { user } = useAuth();
  const {
    applications,
    isLoadingApplications,
    applicationsError,
    fetchApplications,
    updateApplicationStatus,
    withdrawApplication,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Status Update Modal State
  const [editingApp, setEditingApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingApp && !isUpdating) {
        setEditingApp(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingApp, isUpdating]);


  // Normalize status for tab filtering
  const normalizeStatus = (status) => {
    if (status === 'ACCEPTED') return 'SELECTED';
    if (status === 'UNDER_REVIEW') return 'APPLIED';
    return status;
  };

  // Filter applications by tab and search
  const filteredApps = useMemo(() => {
    if (!applications || !Array.isArray(applications)) return [];
    return applications.filter((app) => {
      const norm = normalizeStatus(app.status);
      const matchesStatus =
        statusFilter === 'ALL' ||
        app.status === statusFilter ||
        norm === statusFilter;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.title?.toLowerCase().includes(q) ||
        app.company?.toLowerCase().includes(q) ||
        app.location?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, search]);

  // Compute status counts for tabs
  const tabCounts = useMemo(() => {
    const list = applications || [];
    return {
      all: list.length,
      applied: list.filter((a) => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW').length,
      interview: list.filter((a) => a.status === 'INTERVIEW').length,
      selected: list.filter((a) => a.status === 'SELECTED' || a.status === 'ACCEPTED').length,
      rejected: list.filter((a) => a.status === 'REJECTED').length,
    };
  }, [applications]);

  // Open status edit modal
  const handleOpenStatusModal = (app) => {
    setEditingApp(app);
    setNewStatus(app.status);
    setStatusNotes(app.feedback || app.notes || '');
    setUpdateError('');
  };

  // Submit status update
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingApp) return;

    setIsUpdating(true);
    setUpdateError('');

    const res = await updateApplicationStatus(editingApp.id, newStatus, statusNotes);
    setIsUpdating(false);

    if (res.success) {
      setEditingApp(null);
      setToastMessage(`Updated status for "${editingApp.title}" to ${newStatus}!`);
      setTimeout(() => setToastMessage(''), 4500);
    } else {
      setUpdateError(res.message);
    }
  };

  // Withdraw application
  const handleWithdraw = async (appId, title, company) => {
    if (
      window.confirm(
        `Are you sure you want to withdraw your application for "${title}" at ${company}? This cannot be undone.`
      )
    ) {
      const res = await withdrawApplication(appId);
      if (res.success) {
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(''), 4000);
      } else {
        alert(res.message);
      }
    }
  };

  // Helper for status badge class
  const getBadgeClass = (status) => {
    switch (status) {
      case 'APPLIED':
      case 'UNDER_REVIEW':
        return 'status-badge--applied';
      case 'INTERVIEW':
        return 'status-badge--interview';
      case 'SELECTED':
      case 'ACCEPTED':
        return 'status-badge--selected';
      case 'REJECTED':
        return 'status-badge--rejected';
      default:
        return 'status-badge--applied';
    }
  };

  return (
    <div className="my-applications-page">
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="internships-toast">
          <span>ℹ️</span>
          <p>{toastMessage}</p>
        </div>
      )}

      {/* ── Header ── */}
      <section className="my-applications-header section-alt">
        <div className="container text-center">
          <span className="hero__badge" style={{ marginBottom: 'var(--sp-3)' }}>
            📝 Real-Time Application Tracker
          </span>
          <h1 className="section-title">My Applications</h1>
          <p className="section-subtitle">
            Track interview rounds, recruiter updates, and hiring outcomes from live database records.
          </p>

          {/* ── Search within applications ── */}
          <div className="search-bar" style={{ maxWidth: '480px' }}>
            <span className="search-bar__icon">🔍</span>
            <input
              type="text"
              className="search-bar__input"
              placeholder="Search by role, company, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-bar__clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Filter Tabs & Main Table ── */}
      <section className="section">
        <div className="container">
          {/* Server Error Alert */}
          {applicationsError && (
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
                <strong>Data Sync Error:</strong> {applicationsError}
              </div>
              <Button variant="outline" size="sm" onClick={fetchApplications}>
                Retry Sync
              </Button>
            </div>
          )}

          {/* Status Tabs */}
          <div className="applications-tabs">
            {[
              { id: 'ALL', label: 'All Applications', count: tabCounts.all },
              { id: 'APPLIED', label: 'Applied', count: tabCounts.applied },
              { id: 'INTERVIEW', label: 'Interview 🎙️', count: tabCounts.interview },
              { id: 'SELECTED', label: 'Selected / Offer 🎉', count: tabCounts.selected },
              { id: 'REJECTED', label: 'Rejected / Closed', count: tabCounts.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`app-tab ${statusFilter === tab.id ? 'app-tab--active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label} <span className="app-tab__count">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {isLoadingApplications ? (
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
                Loading your applications from server...
              </p>
            </div>
          ) : filteredApps.length > 0 ? (
            /* Applications Table */
            <div className="applications-table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Role & Company</th>
                    <th>Date Applied</th>
                    <th>Stipend</th>
                    <th>Status</th>
                    <th>Notes & Recruiter Updates</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="app-role-cell">
                          <strong>{app.title}</strong>
                          <span className="app-company-sub">{app.company}</span>
                          {app.location && (
                            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
                              📍 {app.location}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="app-date">{app.appliedDate}</span>
                      </td>
                      <td>
                        <span className="app-stipend">
                          {app.stipend ? `₹${Number(app.stipend).toLocaleString('en-IN')}/mo` : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getBadgeClass(app.status)}`}>
                          {app.status === 'SELECTED' || app.status === 'ACCEPTED'
                            ? '🎉 SELECTED'
                            : app.status === 'INTERVIEW'
                            ? '🎙️ INTERVIEW'
                            : app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="app-feedback-cell">
                          {app.feedback ? (
                            <p className="app-feedback-text">
                              <strong>Update:</strong> {app.feedback}
                            </p>
                          ) : app.notes ? (
                            <p className="app-feedback-text" style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                              <strong>Note:</strong> {app.notes}
                            </p>
                          ) : (
                            <span className="app-feedback-none">No comments added</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => handleOpenStatusModal(app)}
                            title="Update application status or add notes"
                          >
                            Update ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => handleWithdraw(app.id, app.title, app.company)}
                            className="app-withdraw-btn"
                            title="Withdraw application from tracker"
                          >
                            Withdraw ✕
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="dashboard-card text-center" style={{ padding: 'var(--sp-16) var(--sp-6)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--sp-3)' }}>📄</span>
              <h3>No applications in this category</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)' }}>
                {applications.length === 0
                  ? "You haven't submitted any internship applications yet. Browse live listings to begin tracking your progress!"
                  : 'No submitted applications match your active search and status filter.'}
              </p>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
                <Link to="/internships">
                  <Button variant="primary" size="md">
                    Explore Available Internships 🚀
                  </Button>
                </Link>
                {statusFilter !== 'ALL' && (
                  <Button variant="outline" size="md" onClick={() => setStatusFilter('ALL')}>
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Status Update Modal ── */}
      {editingApp && (
        <div className="modal-backdrop" onClick={() => !isUpdating && setEditingApp(null)}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-badge">Application Status Workflow</span>
                <h2 id="status-modal-title">Update Status: {editingApp.title}</h2>
                <p className="modal-company">
                  {editingApp.company} • Currently: <strong>{editingApp.status}</strong>
                </p>
              </div>
              <button
                className="modal-close"
                disabled={isUpdating}
                aria-label="Close modal"
                onClick={() => setEditingApp(null)}
              >
                ✕
              </button>
            </div>

            {updateError && (
              <div
                className="login-form__alert"
                style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}
              >
                {updateError}
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="modal-form">
              <div className="login-form__group">
                <label htmlFor="newStatus" className="login-form__label">
                  Workflow Status:
                </label>
                <select
                  id="newStatus"
                  className="login-form__input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="APPLIED">APPLIED — Application submitted</option>
                  <option value="INTERVIEW">INTERVIEW — Interview scheduled / in progress</option>
                  <option value="SELECTED">SELECTED — Internship offer received 🎉</option>
                  <option value="REJECTED">REJECTED — Application closed / not selected</option>
                </select>
                <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: 'var(--sp-1)' }}>
                  Permitted progression: APPLIED → INTERVIEW → SELECTED or REJECTED.
                </small>
              </div>

              <div className="login-form__group">
                <label htmlFor="statusNotes" className="login-form__label">
                  Recruiter Feedback / Personal Tracking Notes:
                </label>
                <textarea
                  id="statusNotes"
                  className="login-form__textarea"
                  rows="3"
                  placeholder="e.g. Completed technical round with team lead. Awaiting offer letter..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="modal-actions">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setEditingApp(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving to Database...' : 'Save Status Update ✓'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
