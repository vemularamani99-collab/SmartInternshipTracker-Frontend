import { useNavigate } from 'react-router-dom';
import './InternshipCard.css';
import Button from './Button.jsx';

/**
 * Reusable InternshipCard component — displays a single internship listing.
 *
 * Props:
 *   internship     — object with { id, title, company, location, stipend, duration, deadline, logo, tags, description, requirements, applicationUrl, openings }
 *   onApply        — function called when user clicks Apply Now / Add to Tracker
 *   onViewDetails  — function called to view complete internship specifications
 *   isApplied      — boolean indicating if the logged-in student has already applied
 *   userRole       — 'STUDENT' | 'ADMIN' | null
 */
function InternshipCard({
  internship,
  onApply,
  onViewDetails,
  isApplied = false,
  userRole = null,
}) {
  const navigate = useNavigate();
  const {
    id,
    title,
    company,
    location,
    stipend,
    deadline,
    logo = '💼',
    tags = [],
    description,
    applicationUrl,
  } = internship;

  /** Format stipend as ₹40,000/mo */
  const formattedStipend = stipend
    ? `₹${Number(stipend).toLocaleString('en-IN')}/mo`
    : 'Unpaid / Performance based';

  /** Format deadline */
  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Open until filled';

  return (
    <article className="internship-card">
      {/* ── Header ── */}
      <div className="internship-card__header">
        <span className="internship-card__logo">{logo || '💼'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="internship-card__title">{title}</h3>
          <p className="internship-card__company">{company}</p>
        </div>
        {isApplied && (
          <span className="internship-card__applied-badge" title="Already in your application tracker">
            ✓ In My Applications
          </span>
        )}
      </div>

      {/* ── Description ── */}
      <p className="internship-card__desc">
        {description && description.length > 140
          ? `${description.slice(0, 140)}...`
          : description}
      </p>

      {/* ── Tags ── */}
      <div className="internship-card__tags">
        {tags && tags.slice(0, 4).map((tag) => (
          <span key={tag} className="internship-card__tag">
            {tag}
          </span>
        ))}
      </div>

      {/* ── Meta info row ── */}
      <div className="internship-card__meta">
        <div className="internship-card__meta-item">
          <span className="internship-card__meta-icon">📍</span>
          <span>{location}</span>
        </div>
        <div className="internship-card__meta-item">
          <span className="internship-card__meta-icon">💰</span>
          <span>{formattedStipend}</span>
        </div>
        <div className="internship-card__meta-item">
          <span className="internship-card__meta-icon">📅</span>
          <span>{formattedDeadline}</span>
        </div>
      </div>

      {/* ── Actions Row ── */}
      <div className="internship-card__action" style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* View Details Modal Trigger */}
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => onViewDetails && onViewDetails(internship)}
        >
          View Details 🔎
        </Button>

        {/* Official Application URL Link */}
        {applicationUrl && (
          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="internship-card__external-link"
            title="Open official company careers portal"
          >
            Official Portal ↗
          </a>
        )}

        {/* Apply / Add to Tracker Action */}
        <div style={{ marginLeft: 'auto' }}>
          {userRole === 'ADMIN' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/internships')}
            >
              Manage ⚙️
            </Button>
          ) : isApplied ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              style={{ color: 'var(--color-success)', fontWeight: 600 }}
            >
              Applied ✓
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApply && onApply(internship)}
            >
              Add to Applications 🚀
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default InternshipCard;
