import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/Button.jsx';
import './AdminDashboard.css';

/**
 * Admin Dashboard — Central management console for administrators.
 *
 * Connected directly to Spring Boot backend:
 *   - Internships list and count from GET /api/internships
 *   - Registered users list and count from GET /api/admin/users
 *   - Live application reviews
 *
 * Security:
 *   - Enforced by Spring Security @PreAuthorize("hasRole('ADMIN')") on all /api/admin/** endpoints.
 *   - Client routes protected by ProtectedRoute allowedRole="ADMIN".
 */
function AdminDashboard() {
  const { user } = useAuth();
  const {
    internships,
    users,
    applications,
    isLoadingUsers,
    usersError,
    fetchUsers,
    fetchInternships,
  } = useApp();

  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // 'ALL' | 'STUDENT' | 'ADMIN'
  const [userSearch, setUserSearch] = useState('');

  // Compute live platform statistics strictly from backend data
  const stats = useMemo(() => {
    const listingsList = Array.isArray(internships) ? internships : [];
    const usersList = Array.isArray(users) ? users : [];
    const appsList = Array.isArray(applications) ? applications : [];

    const totalListings = listingsList.length;
    const totalUsers = usersList.length;
    const studentCount = usersList.filter((u) => u.role === 'STUDENT').length;
    const adminCount = usersList.filter((u) => u.role === 'ADMIN').length;
    const totalApps = appsList.length;

    return { totalListings, totalUsers, studentCount, adminCount, totalApps };
  }, [internships, users, applications]);

  // Filtered registered users
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    return users.filter((u) => {
      const matchesRole =
        userRoleFilter === 'ALL' || u.role === userRoleFilter;

      const q = userSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.college?.toLowerCase().includes(q) ||
        u.degree?.toLowerCase().includes(q);

      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* ── Admin Header ── */}
        <section className="admin-welcome">
          <div>
            <span
              className="navbar__role-tag navbar__role-tag--admin"
              style={{ display: 'inline-block', marginBottom: 'var(--sp-2)' }}
            >
              Administrator Console
            </span>
            <h1 className="admin-welcome__title">
              {user?.name || 'Administrator'} 👋
            </h1>
            <p className="admin-welcome__sub">
              Platform administration, live user directory, and internship oversight.
            </p>
          </div>

          <div className="admin-welcome__actions">
            <Link to="/admin/internships">
              <Button variant="primary" size="md">
                + Manage & Post Internships ⚙️
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                fetchUsers();
                fetchInternships();
              }}
            >
              🔄 Refresh Data
            </Button>
          </div>
        </section>

        {/* ── Real Backend Metrics Grid ── */}
        <section className="dashboard-stats-grid">
          <div className="stat-card stat-card--purple">
            <div className="stat-card__icon">🏢</div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.totalListings}</span>
              <span className="stat-card__label">Active Internships</span>
            </div>
          </div>

          <div className="stat-card stat-card--amber">
            <div className="stat-card__icon">👥</div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.totalUsers}</span>
              <span className="stat-card__label">Total Registered Users</span>
            </div>
          </div>

          <div className="stat-card stat-card--green">
            <div className="stat-card__icon">🎓</div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.studentCount}</span>
              <span className="stat-card__label">Student Accounts</span>
            </div>
          </div>

          <div className="stat-card stat-card--gray">
            <div className="stat-card__icon">🛡️</div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.adminCount}</span>
              <span className="stat-card__label">Administrators</span>
            </div>
          </div>
        </section>

        {/* ── Registered Users Table Section ── */}
        <section className="admin-queue-card" style={{ marginTop: 'var(--sp-8)' }}>
          <div className="admin-queue-card__header">
            <div>
              <h2 className="dashboard-card__title">Registered Users Directory</h2>
              <p className="dashboard-card__sub">
                Live user accounts verified and managed by Spring Security.
              </p>
            </div>

            {/* Filter controls */}
            <div className="admin-queue-controls">
              <input
                type="text"
                placeholder="Search by name, email, college..."
                className="admin-search-input"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select
                className="admin-select"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="STUDENT">Students ({stats.studentCount})</option>
                <option value="ADMIN">Admins ({stats.adminCount})</option>
              </select>
            </div>
          </div>

          {/* User Fetch Error Banner */}
          {usersError && (
            <div
              className="dashboard-card"
              style={{
                background: '#fee2e2',
                borderColor: '#fca5a5',
                color: '#991b1b',
                margin: 'var(--sp-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>User Retrieval Error:</strong> {usersError}
              </div>
              <Button variant="outline" size="sm" onClick={fetchUsers}>
                Retry Fetch
              </Button>
            </div>
          )}

          {/* Table of Registered Users */}
          {isLoadingUsers ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--sp-12) 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--sp-3)',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>⏳</span>
              <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Loading registered users from backend...
              </p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="applications-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name & Email</th>
                    <th>Account Role</th>
                    <th>College / University</th>
                    <th>Degree / Branch</th>
                    <th>Graduation Year</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-muted)' }}>#{u.id}</strong>
                      </td>
                      <td>
                        <div className="app-role-cell">
                          <strong>{u.name}</strong>
                          <span className="app-company-sub">{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`navbar__role-tag navbar__role-tag--${u.role?.toLowerCase()}`}
                          style={{ display: 'inline-block' }}
                        >
                          {u.role === 'ADMIN' ? '🛡️ ADMIN' : '🎓 STUDENT'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-xs)' }}>
                          {u.college || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-xs)' }}>
                          {u.degree || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {u.graduationYear || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="app-date">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-card text-center" style={{ padding: 'var(--sp-12)' }}>
              <h3>No users match your filter criteria</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
                Try adjusting your search keywords or resetting the role filter.
              </p>
            </div>
          )}
        </section>

        {/* ── Quick Overview Banner ── */}
        <section
          className="dashboard-card"
          style={{
            marginTop: 'var(--sp-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--sp-4)',
          }}
        >
          <div>
            <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--sp-1)' }}>
              Need to post or update internship listings?
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              Use the dedicated management console to create new roles, edit stipends, or delete expired postings.
            </p>
          </div>
          <Link to="/admin/internships">
            <Button variant="primary" size="md">
              Go to Manage Internships →
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
