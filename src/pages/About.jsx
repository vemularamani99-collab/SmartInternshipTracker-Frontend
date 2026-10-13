import './About.css';

/**
 * About page — describes the project, team and technology stack.
 *
 * Sections:
 *   1. Page header with description
 *   2. Mission cards — what the platform does
 *   3. Tech stack — technologies used, great for college viva
 */
function About() {
  return (
    <div className="about-page">
      {/* ── Header ── */}
      <section className="about-page__header section-alt">
        <div className="container text-center">
          <h1 className="section-title">About InternTracker</h1>
          <p className="section-subtitle">
            A full-stack academic project built to simplify how students find and manage internship applications.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="section">
        <div className="container">
          <div className="about__mission-grid">
            <div className="about__mission-card">
              <span className="about__mission-icon">🎯</span>
              <h3>Our Mission</h3>
              <p>
                To provide students with a centralised platform to discover, apply to, and track
                internship opportunities — eliminating scattered spreadsheets and missed deadlines.
              </p>
            </div>
            <div className="about__mission-card">
              <span className="about__mission-icon">👩‍💻</span>
              <h3>For Students</h3>
              <p>
                Browse curated listings, apply with a single click, and monitor your application
                status in real-time. Your dashboard keeps everything organised.
              </p>
            </div>
            <div className="about__mission-card">
              <span className="about__mission-icon">🛡️</span>
              <h3>For Admins</h3>
              <p>
                Post internship listings, manage applications, and review student profiles.
                A clean admin panel makes administration effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="section-alt">
        <div className="container text-center">
          <h2 className="section-title">Built With</h2>
          <p className="section-subtitle">
            Modern technologies chosen for reliability, scalability and learning value.
          </p>
          <div className="about__tech-grid">
            {[
              { icon: '⚛️', name: 'React 18', desc: 'Component-based UI library' },
              { icon: '⚡', name: 'Vite 5', desc: 'Ultra-fast dev server & bundler' },
              { icon: '☕', name: 'Java 17', desc: 'Backend programming language' },
              { icon: '🍃', name: 'Spring Boot 3', desc: 'REST API framework' },
              { icon: '🐬', name: 'MySQL 8', desc: 'Relational database' },
              { icon: '🔐', name: 'JWT Auth', desc: 'Secure token-based auth' },
            ].map((tech) => (
              <div key={tech.name} className="about__tech-card">
                <span className="about__tech-icon">{tech.icon}</span>
                <strong className="about__tech-name">{tech.name}</strong>
                <span className="about__tech-desc">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
