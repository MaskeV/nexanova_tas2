import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSystemStats } from '../../services/reportService';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    getSystemStats()
      .then(res => setStats(res.data || res))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminCards = [
    {
      icon: '👥',
      title: 'User Management',
      description: 'Manage admins and evaluators, create and delete accounts',
      route: '/users',
      color: '#3b82f6',
    },
    {
      icon: '🎓',
      title: 'Participant Management',
      description: 'Add, edit, and manage participant details and information',
      route: '/participants',
      color: '#06b6d4',
    },
    {
      icon: '📦',
      title: 'Batches',
      description: 'Create, edit, and manage evaluation batches with participants',
      route: '/batches',
      color: '#8b5cf6',
    },
    {
      icon: '💻',
      title: 'Technologies',
      description: 'Manage technology tracks, rounds, and evaluation criteria',
      route: '/technologies',
      color: '#06b6d4',
    },
    {
      icon: '📋',
      title: 'Evaluations',
      description: 'Assign evaluators to participants, monitor all evaluations',
      route: '/evaluations',
      color: '#f59e0b',
    },
    {
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'View detailed batch and technology reports, export to CSV',
      route: '/reports',
      color: '#10b981',
    },
  ];

  const statItems = [
    { label: 'Total Batches',         value: stats?.totalBatches,          icon: '📦', color: '#8b5cf6' },
    { label: 'Participants',           value: stats?.totalParticipants,     icon: '🎓', color: '#06b6d4' },
    { label: 'Total Evaluations',      value: stats?.totalEvaluations,      icon: '📋', color: '#f59e0b' },
    { label: 'Completed',              value: stats?.completedEvaluations,  icon: '✅', color: '#10b981' },
    { label: 'Avg Score',              value: stats?.averageScore != null ? Number(stats.averageScore).toFixed(1) : null, icon: '⭐', color: '#ef4444' },
  ];

  return (
    <div className="dashboard-container">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo">A</div>
          <h2>Mock Evaluation System</h2>
        </div>
        <div className="navbar-menu">
          <span className="user-info">{user?.name} · Admin</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* ── Welcome ── */}
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}!</h1>
        </div>

      
        {/* ── Admin Cards ── */}
        <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Management Tools</h3>
        <div className="cards-grid">
          {adminCards.map((card) => (
            <div
              key={card.route}
              className="card"
              onClick={() => navigate(card.route)}
              style={{ cursor: 'pointer', borderTop: `3px solid ${card.color}` }}
            >
              <div className="card-icon" style={{ background: `${card.color}18`, color: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.5rem;
        }

        .stat-box {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border-top: 3px solid;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 1rem;
          }

          .stat-box {
            padding: 1rem;
          }

          .stat-icon {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;