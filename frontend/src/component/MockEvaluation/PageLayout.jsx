// frontend/src/component/MockEvaluation/PageLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './MockEvaluation.css';

/**
 * Wraps every MockEvaluation page with a top navbar that
 * shows the page title, a "← Dashboard" back button, and the
 * logged-in user's name.
 *
 * Usage:
 *   <PageLayout title="📦 Batch Management">
 *     ...page content...
 *   </PageLayout>
 */
const PageLayout = ({ title, children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── Top nav ── */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#3b82f6',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ← Dashboard
          </button>

          <span style={{ color: '#e2e8f0', fontSize: '1.2rem' }}>|</span>

          <h1 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
            margin: 0,
          }}>
            {title}
          </h1>
        </div>

        {/* Right: user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#64748b',
            background: '#f1f5f9',
            padding: '4px 10px',
            borderRadius: 6,
          }}>
            {user?.name} · {user?.role}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;