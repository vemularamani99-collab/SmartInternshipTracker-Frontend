import { Link } from 'react-router-dom';
import './Footer.css';

/**
 * Footer component — displayed at the bottom of every page.
 *
 * Contains:
 *   - Brand and tagline
 *   - Quick navigation links
 *   - Contact/social info placeholder
 *   - Copyright notice
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner container">
        {/* ── Column 1: Brand ── */}
        <div className="footer__col">
          <div className="footer__brand">
            <span className="footer__brand-icon">🎯</span>
            <span className="footer__brand-text">InternTracker</span>
          </div>
          <p className="footer__tagline">
            Your one-stop platform to discover, apply and track internship opportunities.
          </p>
        </div>

        {/* ── Column 2: Quick Links ── */}
        <div className="footer__col">
          <h4 className="footer__heading">Quick Links</h4>
          <ul className="footer__link-list">
            <li><Link to="/" className="footer__link">Home</Link></li>
            <li><Link to="/internships" className="footer__link">Browse Internships</Link></li>
            <li><Link to="/about" className="footer__link">About & Tech Stack</Link></li>
            <li><Link to="/login" className="footer__link">Log In</Link></li>
            <li><Link to="/register" className="footer__link">Register</Link></li>
          </ul>
        </div>

        {/* ── Column 3: Contact ── */}
        <div className="footer__col">
          <h4 className="footer__heading">Contact</h4>
          <ul className="footer__link-list">
            <li className="footer__link">📧 support@interntracker.com</li>
            <li className="footer__link">📞 +91 98765 43210</li>
            <li className="footer__link">📍 Bangalore, India</li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer__bottom">
        <div className="container">
          <p>© {currentYear} Smart Internship Tracker. Built as a college project.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
