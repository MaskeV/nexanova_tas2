import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getMyEvaluations } from '../../services/evaluationService';
import '../../styles/Dashboard.css';

const EvaluatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchEvaluations();
  }, [statusFilter]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await getMyEvaluations({ status: statusFilter });
      setEvaluations(res.data || []);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartEvaluation = (evaluationId) => {
    navigate(`/my-evaluations/${evaluationId}`);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'badge-warning',
      'in-progress': 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#f59e0b',
      'in-progress': '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colorMap[status] || '#6b7280';
  };

  // Summary stats
  const stats = {
    pending: evaluations.filter(e => e.status === 'pending').length,
    inProgress: evaluations.filter(e => e.status === 'in-progress').length,
    completed: evaluations.filter(e => e.status === 'completed').length,
    total: evaluations.length,
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="logo">E</div>
            <h2>Mock Evaluation System</h2>
          </div>
          <div className="navbar-menu">
            <span className="user-info">
              {user?.name} ({user?.role})
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </nav>
        <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48,
              border: '4px solid #dbeafe',
              borderTopColor: '#0066cc',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <p style={{ color: '#374151', fontWeight: 600 }}>Loading your evaluations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo">E</div>
          <h2>Mock Evaluation System</h2>
        </div>
        <div className="navbar-menu">
          <span className="user-info">
            {user?.name} ({user?.role})
          </span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome, {user?.name}!</h1>
          <p className="text-muted">Evaluator Dashboard • Manage your assigned evaluations</p>
        </div>

        {/* Summary Cards */}
        <div className="cards-grid" style={{ marginBottom: '3rem' }}>
          <div className="stat-card">
            <div className="stat-label">Pending Evaluations</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
            <div className="stat-change">Waiting to start</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.inProgress}</div>
            <div className="stat-change">In evaluation</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.completed}</div>
            <div className="stat-change">Submitted</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Assigned</div>
            <div className="stat-value" style={{ color: '#0066cc' }}>{stats.total}</div>
            <div className="stat-change">All evaluations</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <label style={{ fontWeight: 700, color: '#1f2937' }}>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #dbeafe',
              borderRadius: '12px',
              fontSize: '0.875rem',
              color: '#1f2937',
              background: 'white',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <option value="">All Evaluations</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Evaluations List */}
        {evaluations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No Evaluations Found</h3>
            <p>
              {statusFilter 
                ? `No ${statusFilter} evaluations at the moment.` 
                : 'No evaluations assigned to you yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}>
            {evaluations.map((evaluation) => (
              <div
                key={evaluation._id || evaluation.evaluationId}
                style={{
                  background: 'white',
                  border: '2px solid #dbeafe',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  transition: 'all 250ms ease-in-out',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0066cc';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dbeafe';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: '#1f2937',
                      margin: 0,
                      marginBottom: '0.25rem',
                    }}>
                      {evaluation.participant?.username || evaluation.participantName || 'Participant'}
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: 500,
                    }}>
                      {evaluation.participant?.email || ''}
                    </span>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderRadius: '9999px',
                    backgroundColor: evaluation.status === 'completed' ? '#d1fae5' : 
                                    evaluation.status === 'in-progress' ? '#dbeafe' :
                                    evaluation.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: evaluation.status === 'completed' ? '#10b981' :
                          evaluation.status === 'in-progress' ? '#0066cc' :
                          evaluation.status === 'pending' ? '#f59e0b' : '#ef4444',
                  }}>
                    {evaluation.status}
                  </span>
                </div>

                {/* Info */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  fontWeight: 500,
                }}>
                  <div>
                    <strong style={{ color: '#1f2937' }}>Batch:</strong> {evaluation.batch?.name || evaluation.batchName || '—'}
                  </div>
                  <div>
                    <strong style={{ color: '#1f2937' }}>Technology:</strong> {evaluation.technology?.name || evaluation.technologyName || '—'}
                  </div>
                  <div>
                    <strong style={{ color: '#1f2937' }}>Round:</strong> {evaluation.roundNumber || '—'}
                  </div>
                </div>

                {/* Score (if completed) */}
                {evaluation.status === 'completed' && evaluation.totalScore !== null && (
                  <div style={{
                    background: '#d1fae5',
                    border: '1px solid #6ee7b7',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    color: '#065f46',
                  }}>
                    <strong>Score:</strong> {evaluation.totalScore}
                    {evaluation.comments && (
                      <p style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.8rem',
                        fontStyle: 'italic',
                        color: '#047857',
                      }}>
                        "{evaluation.comments}"
                      </p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                {evaluation.status !== 'completed' && evaluation.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStartEvaluation(evaluation._id || evaluation.evaluationId)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 250ms ease-in-out',
                      letterSpacing: '-0.3px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0052a3 0%, #003d7a 100%)';
                      e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 102, 204, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {evaluation.status === 'in-progress' ? 'Continue Evaluation' : 'Start Evaluation'}
                  </button>
                )}

                {evaluation.status === 'completed' && (
                  <div style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f9fafb',
                    border: '1px solid #dbeafe',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#6b7280',
                  }}>
                    ✓ Evaluation Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .stat-card {
          background: white;
          border: 2px solid #dbeafe;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
        }

        .stat-change {
          font-size: 0.8rem;
          color: #6b7280;
          text-align: center;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default EvaluatorDashboard;