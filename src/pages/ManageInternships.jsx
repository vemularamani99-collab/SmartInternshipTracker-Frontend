import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/Button.jsx';
import './ManageInternships.css';

/**
 * Manage Internships Page — Allows Administrators to create, edit, and delete internship listings.
 *
 * Connected directly to Spring Boot backend:
 *   - POST   /api/internships (Create listing)
 *   - PUT    /api/internships/{id} (Edit listing)
 *   - DELETE /api/internships/{id} (Delete listing)
 *
 * Security:
 *   - Protected by Spring Security @PreAuthorize("hasRole('ADMIN')")
 *   - Protected by ProtectedRoute allowedRole="ADMIN" in React Router
 */
function ManageInternships() {
  const {
    internships,
    applications,
    isLoadingInternships,
    internshipsError,
    fetchInternships,
    addInternship,
    updateInternship,
    deleteInternship,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Create mode, number = Edit mode
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen && !isSubmitting) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isSubmitting]);


  // Controlled form state including all required fields
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    internshipType: 'Hybrid',
    stipend: '',
    duration: '3 Months',
    deadline: '',
    tags: '',
    requirements: '',
    description: '',
    applicationUrl: '',
    openings: 1,
  });

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(''), 4500);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal in CREATE mode
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      company: '',
      location: '',
      internshipType: 'Hybrid',
      stipend: '',
      duration: '3 Months',
      deadline: '',
      tags: '',
      requirements: '',
      description: '',
      applicationUrl: '',
      openings: 1,
    });
    setIsModalOpen(true);
  };

  // Open modal in EDIT mode prefilled with existing data
  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      company: item.company || '',
      location: item.location || '',
      internshipType: item.internshipType || 'Hybrid',
      stipend: item.stipend !== undefined && item.stipend !== null ? item.stipend : '',
      duration: item.duration || '3 Months',
      deadline: item.deadline || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      requirements: item.requirements || '',
      description: item.description || '',
      applicationUrl: item.applicationUrl || '',
      openings: item.openings || 1,
    });
    setIsModalOpen(true);
  };

  // Handle Submit (Create or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.company.trim() || !formData.location.trim()) {
      showToast('Please fill in required fields: Role Title, Company, and Location.', true);
      return;
    }

    if (!formData.description.trim()) {
      showToast('Please provide a job description for students.', true);
      return;
    }

    // Validate Application URL format if provided
    if (formData.applicationUrl && formData.applicationUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(formData.applicationUrl.trim())) {
        showToast('Application URL must be a valid web address starting with http:// or https://', true);
        return;
      }
    }

    // Validate sensible stipend values (between ₹0 and ₹50,00,000/month)
    const stipendVal = formData.stipend !== '' && formData.stipend !== null ? Number(formData.stipend) : 0;
    if (isNaN(stipendVal) || stipendVal < 0 || stipendVal > 5000000) {
      showToast('Please enter a sensible stipend amount between ₹0 and ₹50,00,000/month.', true);
      return;
    }

    // Validate deadline is not in the past
    if (formData.deadline) {
      const selectedDeadline = new Date(formData.deadline + 'T23:59:59');
      const now = new Date();
      if (selectedDeadline < now) {
        showToast('Application deadline cannot be in the past.', true);
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      internshipType: formData.internshipType,
      stipend: formData.stipend ? Number(formData.stipend) : 0,
      duration: formData.duration.trim() || '3 Months',
      deadline: formData.deadline || null,
      tags: formData.tags.trim(),
      requirements: formData.requirements.trim() || null,
      description: formData.description.trim(),
      applicationUrl: formData.applicationUrl.trim() || null,
      openings: Number(formData.openings) || 1,
    };

    let res;
    if (editingId) {
      // Edit existing listing
      res = await updateInternship(editingId, payload);
    } else {
      // Create new listing
      res = await addInternship(payload);
    }

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      showToast(res.message);
    } else {
      showToast(res.message, true);
    }
  };

  // Handle Delete with explicit confirmation
  const handleDelete = async (id, title, company) => {
    const confirmed = window.confirm(
      `CONFIRM DELETION:\n\nAre you sure you want to permanently delete the listing "${title}" at ${company}?\n\nThis will remove the listing and all associated applicant records.`
    );

    if (!confirmed) return;

    const res = await deleteInternship(id);
    if (res.success) {
      showToast(res.message);
    } else {
      showToast(res.message, true);
    }
  };

  // Filter listings by search
  const filteredListings = useMemo(() => {
    if (!internships || !Array.isArray(internships)) return [];
    const q = search.toLowerCase().trim();
    return internships.filter((item) => {
      return (
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.internshipType?.toLowerCase().includes(q)
      );
    });
  }, [internships, search]);

  // Calculate applicant counts per internship
  const getApplicantCount = (internshipId) => {
    if (!applications || !Array.isArray(applications)) return 0;
    return applications.filter((app) => app.internshipId === internshipId).length;
  };

  return (
    <div className="manage-internships-page">
      {/* ── Success Toast ── */}
      {toastMessage && (
        <div className="internships-toast">
          <span>✅</span>
          <p>{toastMessage}</p>
        </div>
      )}

      {/* ── Error Toast ── */}
      {toastError && (
        <div className="internships-toast" style={{ borderColor: 'var(--color-danger)' }}>
          <span>⚠️</span>
          <p style={{ color: 'var(--color-danger)' }}>{toastError}</p>
        </div>
      )}

      {/* ── Header ── */}
      <section className="manage-internships-header section-alt">
        <div className="container">
          <div className="manage-header-row">
            <div>
              <span
                className="navbar__role-tag navbar__role-tag--admin"
                style={{ display: 'inline-block', marginBottom: 'var(--sp-2)' }}
              >
                Administrator Portal
              </span>
              <h1 className="section-title">Manage Internship Postings</h1>
              <p className="section-subtitle" style={{ margin: 0, textAlign: 'left' }}>
                Create, update, and manage verified opportunities synced with the database.
              </p>
            </div>

            <div className="manage-header-actions">
              <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
                + Post New Internship
              </Button>
              <Link to="/internships">
                <Button variant="outline" size="md">
                  Public Directory ↗
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Section ── */}
      <section className="section">
        <div className="container">
          {/* Error Banner if connection fails */}
          {internshipsError && (
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
                <strong>Database Error:</strong> {internshipsError}
              </div>
              <Button variant="outline" size="sm" onClick={fetchInternships}>
                Retry Fetch
              </Button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="manage-controls-bar">
            <div className="search-bar" style={{ maxWidth: '420px', margin: 0 }}>
              <span className="search-bar__icon">🔍</span>
              <input
                type="text"
                className="search-bar__input"
                placeholder="Search listing by title, company, type..."
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

            <span className="manage-listings-counter">
              Total Active Postings: <strong>{internships.length}</strong>
            </span>
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
                Loading listings from database...
              </p>
            </div>
          ) : filteredListings.length > 0 ? (
            /* Table of Listings */
            <div className="applications-table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Role & Company</th>
                    <th>Type & Location</th>
                    <th>Stipend</th>
                    <th>Deadline</th>
                    <th>Applicants</th>
                    <th>Official Portal</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="app-role-cell">
                          <strong>{item.title}</strong>
                          <span className="app-company-sub">{item.company}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className="manage-location-tag">📍 {item.location}</span>
                          {item.internshipType && (
                            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                              🏷️ {item.internshipType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-text)' }}>
                          {item.stipend ? `₹${Number(item.stipend).toLocaleString('en-IN')}/mo` : 'Unpaid'}
                        </strong>
                      </td>
                      <td>
                        <span className="app-date">{item.deadline || 'Ongoing'}</span>
                      </td>
                      <td>
                        <span className="manage-applicants-badge">
                          👥 {getApplicantCount(item.id)} applicant{getApplicantCount(item.id) === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td>
                        {item.applicationUrl ? (
                          <a
                            href={item.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 'var(--fs-xs)',
                              color: 'var(--color-primary)',
                              textDecoration: 'underline',
                              fontWeight: 600,
                            }}
                          >
                            Open Link ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-light)' }}>
                            Direct only
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit this listing"
                          >
                            Edit ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => handleDelete(item.id, item.title, item.company)}
                            className="app-withdraw-btn"
                            title="Delete this listing"
                          >
                            Delete 🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-card text-center" style={{ padding: 'var(--sp-12)' }}>
              <h3>No listings match your search</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
                Try searching for another keyword or click &quot;Post New Internship&quot; to publish one.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Create / Edit Internship Modal ── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: '680px' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-badge">{editingId ? 'Update Listing' : 'New Listing'}</span>
                <h2 id="manage-modal-title">{editingId ? 'Edit Internship Opportunity' : 'Add Internship Opportunity'}</h2>
                <p className="modal-company">
                  {editingId
                    ? 'Modify specifications and save updates directly to the database.'
                    : 'Fill in the specifications to publish for all students.'}
                </p>
              </div>
              <button
                className="modal-close"
                disabled={isSubmitting}
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Title & Company */}
              <div className="manage-modal-grid">
                <div className="login-form__group">
                  <label htmlFor="modal-title" className="login-form__label">
                    Internship Role Title *
                  </label>
                  <input
                    type="text"
                    id="modal-title"
                    name="title"
                    className="login-form__input"
                    placeholder="e.g. Cloud Engineer Intern"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="login-form__group">
                  <label htmlFor="modal-company" className="login-form__label">
                    Hiring Company *
                  </label>
                  <input
                    type="text"
                    id="modal-company"
                    name="company"
                    className="login-form__input"
                    placeholder="e.g. Oracle / Cisco"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Location & Internship Type */}
              <div className="manage-modal-grid">
                <div className="login-form__group">
                  <label htmlFor="modal-location" className="login-form__label">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="modal-location"
                    name="location"
                    className="login-form__input"
                    placeholder="e.g. Bangalore / Remote"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="login-form__group">
                  <label htmlFor="modal-internshipType" className="login-form__label">
                    Internship Type *
                  </label>
                  <select
                    id="modal-internshipType"
                    name="internshipType"
                    className="login-form__input"
                    value={formData.internshipType}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Full-time">Full-time Intern</option>
                    <option value="Part-time">Part-time Intern</option>
                  </select>
                </div>
              </div>

              {/* Stipend & Deadline */}
              <div className="manage-modal-grid">
                <div className="login-form__group">
                  <label htmlFor="modal-stipend" className="login-form__label">
                    Monthly Stipend (₹)
                  </label>
                  <input
                    type="number"
                    id="modal-stipend"
                    name="stipend"
                    min="0"
                    max="5000000"
                    className="login-form__input"
                    placeholder="e.g. 45000"
                    value={formData.stipend}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="login-form__group">
                  <label htmlFor="modal-deadline" className="login-form__label">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="modal-deadline"
                    name="deadline"
                    className="login-form__input"
                    value={formData.deadline}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Required Skills & Tags */}
              <div className="manage-modal-grid">
                <div className="login-form__group">
                  <label htmlFor="modal-tags" className="login-form__label">
                    Skill Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="modal-tags"
                    name="tags"
                    className="login-form__input"
                    placeholder="e.g. Java, Spring Boot, MySQL"
                    value={formData.tags}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="login-form__group">
                  <label htmlFor="modal-openings" className="login-form__label">
                    Number of Openings
                  </label>
                  <input
                    type="number"
                    id="modal-openings"
                    name="openings"
                    min="1"
                    className="login-form__input"
                    value={formData.openings}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Official Application URL */}
              <div className="login-form__group">
                <label htmlFor="modal-applicationUrl" className="login-form__label">
                  Official Application / Company Careers URL
                </label>
                <input
                  type="url"
                  id="modal-applicationUrl"
                  name="applicationUrl"
                  className="login-form__input"
                  placeholder="https://careers.company.com/jobs/intern-role"
                  value={formData.applicationUrl}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                  Students will be able to open this link directly to apply on the official portal.
                </small>
              </div>

              {/* Requirements */}
              <div className="login-form__group">
                <label htmlFor="modal-requirements" className="login-form__label">
                  Candidate Requirements & Eligibility
                </label>
                <textarea
                  id="modal-requirements"
                  name="requirements"
                  className="login-form__textarea"
                  rows="2"
                  placeholder="Required degrees, CGPA cutoff, programming languages..."
                  value={formData.requirements}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="login-form__group">
                <label htmlFor="modal-description" className="login-form__label">
                  Job Description & Learning Scope *
                </label>
                <textarea
                  id="modal-description"
                  name="description"
                  className="login-form__textarea"
                  rows="3"
                  placeholder="Outline responsibilities, team structure, and projects the intern will deliver..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="modal-actions">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving to Database...'
                    : editingId
                    ? 'Save Changes ✓'
                    : 'Publish Listing 🚀'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageInternships;
