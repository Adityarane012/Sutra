import React from 'react';

/**
 * Top-Level Error Boundary to prevent white-screen crashes during demos or live evaluation.
 * If any component throws an unexpected exception, it renders a friendly Indian-context
 * recovery UI allowing the user to reset without losing application state.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sutra ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('sutra-demo-v2');
    } catch {}
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--cream, #f7f3ea)',
          color: 'var(--ink, #1b2a3a)',
          padding: '24px',
          fontFamily: "'Nunito Sans', system-ui, sans-serif"
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--paper, #fbfaf6)',
            border: '2px solid var(--accent, #b5501c)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>🌿</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--accent, #b5501c)', fontFamily: "'Domine', Georgia, serif" }}>
                  Kuch Gadbad Ho Gayi / Something went wrong
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted, #5f6672)' }}>
                  Sutra caught an unexpected display issue.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '15px', lineHeight: 1.5, margin: '0 0 16px' }}>
              Aap chinta mat kijiye — aapka demo session safe hai. Reload karne se ye theek ho jayega.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: 'var(--sand, #ede5d3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'monospace',
                marginBottom: '20px',
                wordBreak: 'break-word',
                color: '#555'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: 'var(--accent, #b5501c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: 'transparent',
                  color: 'var(--ink, #1b2a3a)',
                  border: '1px solid var(--line, #ddd3be)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
