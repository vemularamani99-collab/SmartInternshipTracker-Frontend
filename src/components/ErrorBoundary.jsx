import { Component } from 'react';
import Button from './Button.jsx';

/**
 * React Error Boundary — Catches rendering errors anywhere in child components
 * and displays an accessible, user-friendly fallback view instead of a blank screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a component error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--sp-8)',
          }}
        >
          <div
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--sp-12)',
              maxWidth: '560px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: 'var(--sp-4)' }}>
              ⚠️
            </span>
            <h1
              style={{
                fontSize: 'var(--fs-2xl)',
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 'var(--sp-2)',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: 'var(--sp-6)',
              }}
            >
              An unexpected error occurred while rendering this view. Your session and data are secure.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: 'var(--color-bg-page)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--fs-xs)',
                  fontFamily: 'monospace',
                  marginBottom: 'var(--sp-6)',
                  textAlign: 'left',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
              <Button variant="primary" size="md" onClick={this.handleReset}>
                Reload Application 🔄
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => (window.location.href = '/')}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
