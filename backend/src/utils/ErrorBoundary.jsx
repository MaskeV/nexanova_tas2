import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ERROR CAUGHT BY BOUNDARY:', error);
    console.error('📋 ERROR INFO:', errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
          >
            <h1
              style={{
                color: '#dc2626',
                marginBottom: '1rem',
                fontSize: '28px',
                fontWeight: '700',
              }}
            >
              ⚠️ Something went wrong
            </h1>

            <p
              style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
                fontSize: '16px',
                lineHeight: '1.6',
              }}
            >
              The application encountered an error. Here's what happened:
            </p>

            {this.state.error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontFamily: 'Monaco, monospace',
                  fontSize: '12px',
                  color: '#7f1d1d',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <strong>Error Message:</strong>
                <pre style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            {this.state.errorInfo && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontFamily: 'Monaco, monospace',
                  fontSize: '11px',
                  color: '#7f1d1d',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <strong>Stack Trace:</strong>
                <pre style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
            >
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.background = '#991b1b')}
                onMouseLeave={(e) => (e.target.style.background = '#dc2626')}
              >
                Try Again
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                Go Home
              </button>
            </div>

            <p
              style={{
                marginTop: '1.5rem',
                fontSize: '12px',
                color: '#9ca3af',
              }}
            >
              💡 Tip: Open your browser's Developer Tools (F12) → Console tab to see detailed error logs.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;