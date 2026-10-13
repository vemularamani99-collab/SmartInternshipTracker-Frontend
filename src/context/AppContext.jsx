import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';
import { SAMPLE_INTERNSHIPS } from '../data/sampleInternships.js';

/**
 * AppContext — Central state and API integration for Internships & Applications.
 *
 * Connected directly to Spring Boot REST endpoints:
 *   - GET    /api/internships
 *   - GET    /api/applications/my
 *   - POST   /api/applications
 *   - PATCH  /api/applications/{id}/status
 *   - DELETE /api/applications/{id}
 *   - GET    /api/admin/users
 *
 * Dual-Mode Resilience:
 *   - Automatically connects to Spring Boot on http://localhost:8080 when running.
 *   - If the backend is starting or offline, falls back gracefully to local state so
 *     all buttons, filters, searches, forms, and modals function reliably.
 */

const AppContext = createContext(null);

/** Helper to normalize internship data for components */
export const formatInternship = (item) => {
  if (!item) return item;
  return {
    ...item,
    id: item.id || Date.now(),
    title: item.title || 'Untitled Internship',
    company: item.company || 'Tech Company',
    location: item.location || 'Remote',
    stipend: item.stipend != null ? item.stipend : 0,
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === 'string'
      ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
  };
};

/** Helper to normalize application data for components */
export const formatApplication = (app) => {
  if (!app) return app;
  const appliedDateStr = app.appliedAt
    ? new Date(app.appliedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : app.appliedDate || 'Recent';

  return {
    ...app,
    id: app.id || Date.now(),
    title: app.internshipTitle || app.title || 'Internship Application',
    company: app.company || 'Company',
    location: app.location || 'Remote',
    stipend: app.stipend != null ? app.stipend : 0,
    status: app.status || 'APPLIED',
    appliedDate: appliedDateStr,
  };
};

export function AppProvider({ children }) {
  const { user, isAuthenticated, isStudent, isAdmin } = useAuth();

  // Load initial internships from local cache or curated sample data
  const [internships, setInternships] = useState(() => {
    try {
      const cached = localStorage.getItem('app_internships');
      if (cached) {
        return JSON.parse(cached).map(formatInternship);
      }
    } catch {
      // fallback
    }
    return SAMPLE_INTERNSHIPS.map(formatInternship);
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('app_applications');
      if (saved) return JSON.parse(saved).map(formatApplication);
    } catch {
      // fallback
    }
    return [
      {
        id: 101,
        internshipId: 1,
        internshipTitle: 'Frontend Developer Intern',
        title: 'Frontend Developer Intern',
        company: 'Google',
        location: 'Bangalore (Hybrid)',
        stipend: 45000,
        status: 'INTERVIEW',
        appliedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        notes: 'Passed technical screen; awaiting round 2 schedule.',
        feedback: 'Round 1 technical review completed successfully.',
        resumeUrl: 'https://drive.google.com/sample-resume.pdf',
      },
    ];
  });

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'student@example.com',
      role: 'STUDENT',
      college: 'National Institute of Technology',
      degree: 'B.Tech Computer Science',
      graduationYear: 2026,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 99,
      name: 'Placement Administrator',
      email: 'admin@example.com',
      role: 'ADMIN',
      college: 'Placement Cell',
      degree: 'Administration',
      graduationYear: null,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ]);

  const [isLoadingInternships, setIsLoadingInternships] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [internshipsError, setInternshipsError] = useState(null);
  const [applicationsError, setApplicationsError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  /**
   * Fetch all live internships from GET /api/internships
   */
  const fetchInternships = useCallback(async () => {
    setIsLoadingInternships(true);
    setInternshipsError(null);
    try {
      const response = await api.get('/internships?page=0&size=100&sortBy=createdAt&sortDir=desc');
      const data = response.data?.data;
      const list = data?.content || (Array.isArray(data) ? data : []);
      if (list && list.length > 0) {
        const formatted = list.map(formatInternship);
        setInternships(formatted);
        localStorage.setItem('app_internships', JSON.stringify(formatted));
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.info('Spring Boot backend on port 8080 offline. Using local interactive dataset:', err.message);
      setIsBackendConnected(false);
      // Use existing state or default sample internships so user experience is never blocked
      setInternships((prev) => (prev && prev.length > 0 ? prev : SAMPLE_INTERNSHIPS.map(formatInternship)));
    } finally {
      setIsLoadingInternships(false);
    }
  }, []);

  /**
   * Fetch authenticated student's applications from GET /api/applications/my
   */
  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated || !isStudent) {
      setIsLoadingApplications(false);
      return;
    }

    setIsLoadingApplications(true);
    setApplicationsError(null);
    try {
      const response = await api.get('/applications/my');
      const list = response.data?.data || [];
      if (Array.isArray(list)) {
        const formatted = list.map(formatApplication);
        setApplications(formatted);
        localStorage.setItem('app_applications', JSON.stringify(formatted));
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.info('Backend offline, using saved local applications.');
      setIsBackendConnected(false);
    } finally {
      setIsLoadingApplications(false);
    }
  }, [isAuthenticated, isStudent]);

  /**
   * Fetch all registered users from GET /api/admin/users (Admin only)
   */
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      setIsLoadingUsers(false);
      return;
    }

    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data?.data || []);
      setIsBackendConnected(true);
    } catch (err) {
      console.info('Backend offline, using local users directory.');
      setIsBackendConnected(false);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Initial load
  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  // Sync applications when auth state changes
  useEffect(() => {
    if (isAuthenticated && isStudent) {
      fetchApplications();
    }
  }, [isAuthenticated, isStudent, fetchApplications]);

  // Sync users when admin logs in
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, fetchUsers]);

  /**
   * Student: Submit an application
   */
  const applyToInternship = async (internshipId, additionalInfo = {}) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please log in to apply for internships.' };
    }
    if (!isStudent) {
      return { success: false, message: 'Only student accounts can submit applications.' };
    }

    const payload = {
      internshipId,
      notes: additionalInfo.notes || null,
      resumeUrl: additionalInfo.resumeUrl || null,
    };

    // Find the target internship
    const targetInternship = internships.find((item) => item.id === internshipId);

    try {
      const response = await api.post('/applications', payload);
      const newApp = formatApplication(response.data?.data);

      setApplications((prev) => {
        const updated = [newApp, ...prev.filter((a) => a.id !== newApp.id)];
        localStorage.setItem('app_applications', JSON.stringify(updated));
        return updated;
      });

      fetchInternships();

      return {
        success: true,
        message: response.data?.message || 'Application submitted successfully!',
        application: newApp,
      };
    } catch (err) {
      // If error came from real backend (e.g. duplicate application 400/409), return backend message
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }

      // Offline mode fallback: submit and persist locally
      const offlineApp = formatApplication({
        id: Date.now(),
        internshipId,
        internshipTitle: targetInternship?.title || 'Internship Role',
        title: targetInternship?.title || 'Internship Role',
        company: targetInternship?.company || 'Company',
        location: targetInternship?.location || 'Remote',
        stipend: targetInternship?.stipend || 0,
        status: 'APPLIED',
        notes: payload.notes,
        resumeUrl: payload.resumeUrl,
        appliedAt: new Date().toISOString(),
      });

      setApplications((prev) => {
        const updated = [offlineApp, ...prev.filter((a) => a.internshipId !== internshipId)];
        localStorage.setItem('app_applications', JSON.stringify(updated));
        return updated;
      });

      // Increment applicant counter on internship
      setInternships((prev) =>
        prev.map((item) =>
          item.id === internshipId
            ? { ...item, applicationCount: (item.applicationCount || 0) + 1 }
            : item
        )
      );

      return {
        success: true,
        message: 'Application submitted successfully! (Saved in tracker)',
        application: offlineApp,
      };
    }
  };

  /**
   * Student / Admin: Update application status via PATCH /api/applications/{id}/status
   */
  const updateApplicationStatus = async (applicationId, newStatus, feedback = '') => {
    try {
      const response = await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
        feedback: feedback || null,
      });

      const updated = formatApplication(response.data?.data);

      setApplications((prev) => {
        const next = prev.map((app) => (app.id === applicationId ? updated : app));
        localStorage.setItem('app_applications', JSON.stringify(next));
        return next;
      });

      return {
        success: true,
        message: response.data?.message || `Status updated to ${newStatus}.`,
        application: updated,
      };
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }

      // Offline fallback
      setApplications((prev) => {
        const next = prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: newStatus, feedback: feedback || app.feedback }
            : app
        );
        localStorage.setItem('app_applications', JSON.stringify(next));
        return next;
      });

      return {
        success: true,
        message: `Status updated to ${newStatus} successfully!`,
      };
    }
  };

  /**
   * Student: Withdraw application
   */
  const withdrawApplication = async (applicationId) => {
    try {
      await api.delete(`/applications/${applicationId}`);
      fetchInternships();
    } catch {
      // continue locally
    }

    setApplications((prev) => {
      const next = prev.filter((app) => app.id !== applicationId);
      localStorage.setItem('app_applications', JSON.stringify(next));
      return next;
    });

    return {
      success: true,
      message: 'Application withdrawn successfully.',
    };
  };

  /**
   * Admin: Create new internship
   */
  const addInternship = async (internshipData) => {
    const payload = {
      ...internshipData,
      tags: Array.isArray(internshipData.tags)
        ? internshipData.tags.join(', ')
        : internshipData.tags,
    };

    try {
      const response = await api.post('/internships', payload);
      const created = formatInternship(response.data?.data);

      setInternships((prev) => {
        const next = [created, ...prev];
        localStorage.setItem('app_internships', JSON.stringify(next));
        return next;
      });

      return { success: true, message: 'Internship posted successfully!', internship: created };
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }

      // Offline fallback
      const createdOffline = formatInternship({
        ...payload,
        id: Date.now(),
        applicationCount: 0,
        createdAt: new Date().toISOString(),
      });

      setInternships((prev) => {
        const next = [createdOffline, ...prev];
        localStorage.setItem('app_internships', JSON.stringify(next));
        return next;
      });

      return { success: true, message: 'Internship published successfully!', internship: createdOffline };
    }
  };

  /**
   * Admin: Delete internship
   */
  const deleteInternship = async (internshipId) => {
    try {
      await api.delete(`/internships/${internshipId}`);
    } catch {
      // offline continue
    }

    setInternships((prev) => {
      const next = prev.filter((item) => item.id !== internshipId);
      localStorage.setItem('app_internships', JSON.stringify(next));
      return next;
    });

    return { success: true, message: 'Internship listing deleted.' };
  };

  /**
   * Admin: Update internship
   */
  const updateInternship = async (internshipId, internshipData) => {
    const payload = {
      ...internshipData,
      tags: Array.isArray(internshipData.tags)
        ? internshipData.tags.join(', ')
        : internshipData.tags,
    };

    try {
      const response = await api.put(`/internships/${internshipId}`, payload);
      const updated = formatInternship(response.data?.data);

      setInternships((prev) => {
        const next = prev.map((item) => (item.id === internshipId ? updated : item));
        localStorage.setItem('app_internships', JSON.stringify(next));
        return next;
      });

      return { success: true, message: 'Internship updated successfully!', internship: updated };
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }

      // Offline fallback
      setInternships((prev) => {
        const next = prev.map((item) =>
          item.id === internshipId ? formatInternship({ ...item, ...payload }) : item
        );
        localStorage.setItem('app_internships', JSON.stringify(next));
        return next;
      });

      return { success: true, message: 'Internship updated successfully!' };
    }
  };

  /**
   * Reset / refresh data from database or sample listings
   */
  const resetToSampleData = () => {
    localStorage.removeItem('app_internships');
    localStorage.removeItem('app_applications');
    setInternships(SAMPLE_INTERNSHIPS.map(formatInternship));
    fetchInternships();
    fetchApplications();
  };

  return (
    <AppContext.Provider
      value={{
        internships,
        applications,
        users,
        isLoadingInternships,
        isLoadingApplications,
        isLoadingUsers,
        internshipsError,
        applicationsError,
        usersError,
        isBackendConnected,
        fetchInternships,
        fetchApplications,
        fetchUsers,
        applyToInternship,
        updateApplicationStatus,
        withdrawApplication,
        addInternship,
        updateInternship,
        deleteInternship,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
