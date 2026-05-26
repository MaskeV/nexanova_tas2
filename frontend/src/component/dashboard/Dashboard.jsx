import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMyEvaluations } from '../../services/evaluationService';
import { getAllTechnologies } from '../../services/technologyService';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [evalStats, setEvalStats] = useState(null);
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getMyEvaluations();
      const evals = res.data || [];
      
      // Calculate stats
      setEvalStats({
        total: evals.length,
        pending: evals.filter(e => e.status === 'pending').length,
        inProgress: evals.filter(e => e.status === 'in-progress').length,
        completed: evals.filter(e => e.status === 'completed').length,
      });

      // Get recent evaluations (last 5)
      const recent = evals
        .sort((a, b) => new Date(b.updatedAt || b.assignedDate) - new Date(a.updatedAt || a.assignedDate))
        .slice(0, 5);
      setRecentEvaluations(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setEvalStats(null);
      setRecentEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cards = [
    {
      icon: '📝',
      title: 'My Evaluations',
      description: 'View and submit your assigned evaluations',
      route: '/my-evaluations',
      color: '#3b82f6',
      live: true,
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your evaluation progress and statistics',
      color: '#8b5cf6',
      live: true,
      onClick: () => setShowProgressModal(true),
    },
    {
      icon: '📚',
      title: 'Evaluation Guidelines',
      description: 'Access evaluation standards and best practices',
      color: '#06b6d4',
      live: true,
      onClick: () => setShowGuidelinesModal(true),
    },
    {
      icon: '🕒',
      title: 'Recent Activity',
      description: 'View your recent evaluation activities',
      color: '#f59e0b',
      live: true,
      onClick: () => setShowActivityModal(true),
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'Manage your account preferences',
      color: '#10b981',
      live: true,
      onClick: () => setShowSettingsModal(true),
    },
  ];

  const handleCardClick = (card) => {
    if (!card.live) return;
    if (card.route) {
      navigate(card.route);
    } else if (card.onClick) {
      card.onClick();
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo">E</div>
          <h2>Mock Evaluation System</h2>
        </div>
        <div className="navbar-menu">
          <span className="user-info">{user?.name} · Evaluator</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome, {user?.name}!</h1>
          <p className="text-muted">Here's your evaluation overview</p>
        </div>

        {/* Quick Stats */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {loading ? '…' : (evalStats?.pending ?? '—')}
              </div>
              <div className="stat-change">Awaiting your review</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">In Progress</div>
              <div className="stat-value" style={{ color: '#3b82f6' }}>
                {loading ? '…' : (evalStats?.inProgress ?? '—')}
              </div>
              <div className="stat-change">Currently open</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Completed</div>
              <div className="stat-value" style={{ color: '#10b981' }}>
                {loading ? '…' : (evalStats?.completed ?? '—')}
              </div>
              <div className="stat-change">All time</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Assigned</div>
              <div className="stat-value">
                {loading ? '…' : (evalStats?.total ?? '—')}
              </div>
              <div className="stat-change">Across all rounds</div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Quick Actions</h3>
        <div className="cards-grid">
          {cards.map((card) => (
            <div
              key={card.title}
              className="card"
              onClick={() => handleCardClick(card)}
              style={{ 
                cursor: card.live ? 'pointer' : 'default',
                borderTop: `3px solid ${card.color}`
              }}
            >
              <div className="card-icon" style={{ background: `${card.color}18`, color: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {!card.live && <span className="badge">Coming Soon</span>}
            </div>
          ))}
        </div>

        {/* Progress Tracking Modal */}
        {showProgressModal && (
          <ProgressTrackingModal 
            evalStats={evalStats}
            evaluations={recentEvaluations}
            onClose={() => setShowProgressModal(false)}
          />
        )}

        {/* Guidelines Modal */}
        {showGuidelinesModal && (
          <EvaluationGuidelinesModal onClose={() => setShowGuidelinesModal(false)} />
        )}

        {/* Activity Modal */}
        {showActivityModal && (
          <RecentActivityModal 
            evaluations={recentEvaluations}
            onClose={() => setShowActivityModal(false)}
          />
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <SettingsModal 
            user={user}
            onClose={() => setShowSettingsModal(false)}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// PROGRESS TRACKING MODAL
// ============================================
const ProgressTrackingModal = ({ evalStats, evaluations, onClose }) => {
  const completionRate = evalStats?.total > 0 
    ? Math.round((evalStats.completed / evalStats.total) * 100) 
    : 0;

  // Calculate average score from completed evaluations
  const completedEvals = evaluations.filter(e => e.status === 'completed' && e.totalScore != null);
  const avgScore = completedEvals.length > 0
    ? (completedEvals.reduce((sum, e) => sum + e.totalScore, 0) / completedEvals.length).toFixed(1)
    : 'N/A';

  // Group by technology
  const byTechnology = {};
  evaluations.forEach(ev => {
    const tech = ev.technology?.name || ev.technologyName || 'Unknown';
    if (!byTechnology[tech]) {
      byTechnology[tech] = { total: 0, completed: 0 };
    }
    byTechnology[tech].total++;
    if (ev.status === 'completed') byTechnology[tech].completed++;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Progress Tracking</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {/* Overall Progress */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1f2937' }}>
              Overall Completion Rate
            </h3>
            <div style={{
              background: '#f3f4f6',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.5rem' }}>
                {completionRate}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {evalStats?.completed} of {evalStats?.total} evaluations completed
              </div>
              <div style={{
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '999px',
                marginTop: '1rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${completionRate}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <StatCard label="Average Score" value={avgScore} color="#10b981" />
            <StatCard label="Pending" value={evalStats?.pending || 0} color="#f59e0b" />
            <StatCard label="In Progress" value={evalStats?.inProgress || 0} color="#3b82f6" />
            <StatCard label="Completed" value={evalStats?.completed || 0} color="#10b981" />
          </div>

          {/* By Technology */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1f2937' }}>
              Progress by Technology
            </h3>
            {Object.keys(byTechnology).length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                No evaluations assigned yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(byTechnology).map(([tech, stats]) => {
                  const techRate = stats.total > 0 
                    ? Math.round((stats.completed / stats.total) * 100) 
                    : 0;
                  return (
                    <div key={tech} style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}>
                        <span style={{ fontWeight: '600', color: '#374151' }}>{tech}</span>
                        <span style={{ color: '#6b7280' }}>
                          {stats.completed}/{stats.total} ({techRate}%)
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: '#e5e7eb',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${techRate}%`,
                          background: '#3b82f6',
                          borderRadius: '999px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          textAlign: 'right'
        }}>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '1.75rem', fontWeight: '800', color, marginBottom: '0.25rem' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
      {label}
    </div>
  </div>
);

// ============================================
// EVALUATION GUIDELINES MODAL
// ============================================
const EvaluationGuidelinesModal = ({ onClose }) => {
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTechnologies({ isActive: true })
      .then(res => {
        const techs = res.data || [];
        setTechnologies(techs);
        if (techs.length > 0) setSelectedTech(techs[0]);
      })
      .catch(err => console.error('Failed to load technologies:', err))
      .finally(() => setLoading(false));
  }, []);

  const generalGuidelines = [
    {
      title: 'Be Objective',
      description: 'Evaluate based on defined criteria, not personal preferences. Use the rubric provided for each technology.'
    },
    {
      title: 'Provide Constructive Feedback',
      description: 'Comments should be specific, actionable, and helpful for the participant\'s growth.'
    },
    {
      title: 'Be Consistent',
      description: 'Apply the same standards to all participants to ensure fairness across evaluations.'
    },
    {
      title: 'Document Everything',
      description: 'Record detailed notes during evaluations to support your scoring decisions.'
    },
    {
      title: 'Timely Submission',
      description: 'Complete evaluations within the assigned timeframe to maintain the schedule.'
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Evaluation Guidelines</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* General Guidelines */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1f2937' }}>
              General Best Practices
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {generalGuidelines.map((guideline, idx) => (
                <div key={idx} style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '700', 
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    {idx + 1}. {guideline.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                    {guideline.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology-Specific Criteria */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1f2937' }}>
              Technology-Specific Criteria
            </h3>
            
            {loading ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                Loading technologies...
              </p>
            ) : technologies.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                No technologies configured yet
              </p>
            ) : (
              <>
                {/* Technology Selector */}
                <select
                  value={selectedTech?.technologyId || ''}
                  onChange={(e) => {
                    const tech = technologies.find(t => t.technologyId === e.target.value);
                    setSelectedTech(tech);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dbeafe',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {technologies.map(tech => (
                    <option key={tech.technologyId} value={tech.technologyId}>
                      {tech.name} ({tech.rounds} round{tech.rounds > 1 ? 's' : ''})
                    </option>
                  ))}
                </select>

                {/* Selected Technology Details */}
                {selectedTech && (
                  <div style={{
                    background: '#eff6ff',
                    border: '2px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', marginBottom: '1rem' }}>
                      {selectedTech.name}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '1rem' }}>
                      {selectedTech.description || 'No description provided'}
                    </p>
                    <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '1rem' }}>
                      <strong>Category:</strong> {selectedTech.category} | <strong>Rounds:</strong> {selectedTech.rounds}
                    </div>

                    {/* Evaluation Criteria */}
                    {selectedTech.evaluationCriteria && selectedTech.evaluationCriteria.length > 0 ? (
                      <div>
                        <h5 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.75rem' }}>
                          Evaluation Criteria:
                        </h5>
                        {Array.from({ length: selectedTech.rounds }, (_, i) => i + 1).map(round => {
                          const roundCriteria = selectedTech.evaluationCriteria.filter(c => c.roundNumber === round);
                          return (
                            <div key={round} style={{ marginBottom: '1rem' }}>
                              <div style={{ 
                                fontSize: '0.8125rem', 
                                fontWeight: '700', 
                                color: '#1e40af',
                                marginBottom: '0.5rem'
                              }}>
                                Round {round}:
                              </div>
                              {roundCriteria.length === 0 ? (
                                <p style={{ fontSize: '0.75rem', color: '#60a5fa', fontStyle: 'italic', marginLeft: '1rem' }}>
                                  No specific criteria defined
                                </p>
                              ) : (
                                <ul style={{ marginLeft: '1.5rem', fontSize: '0.8125rem', color: '#1e40af' }}>
                                  {roundCriteria.map((criteria, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                      <strong>{criteria.criteriaName}</strong> (Max: {criteria.maxScore} points)
                                      {criteria.description && (
                                        <span style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'block', marginTop: '0.125rem' }}>
                                          {criteria.description}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: '#60a5fa', fontStyle: 'italic' }}>
                        No evaluation criteria defined for this technology
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          textAlign: 'right'
        }}>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// RECENT ACTIVITY MODAL
// ============================================
const RecentActivityModal = ({ evaluations, onClose }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      'in-progress': '#3b82f6',
      completed: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      'in-progress': '📝',
      completed: '✅'
    };
    return icons[status] || '📋';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🕒 Recent Activity</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {evaluations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontSize: '0.875rem' }}>No recent activity to display</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {evaluations.map((ev, idx) => (
                <div key={ev._id || idx} style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  {/* Icon */}
                  <div style={{
                    fontSize: '1.5rem',
                    width: '40px',
                    height: '40px',
                    background: 'white',
                    border: `2px solid ${getStatusColor(ev.status)}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getStatusIcon(ev.status)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{ 
                          fontSize: '0.9375rem', 
                          fontWeight: '700', 
                          color: '#374151',
                          margin: 0
                        }}>
                          {ev.participant?.name || ev.participant?.username || ev.participantName || 'Participant'}
                        </h4>
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          margin: '0.125rem 0 0'
                        }}>
                          {ev.technology?.name || ev.technologyName || 'Technology'} · Round {ev.round}
                        </p>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.6875rem',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        background: `${getStatusColor(ev.status)}20`,
                        color: getStatusColor(ev.status)
                      }}>
                        {ev.status}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      <span>📦 {ev.batch?.name || ev.batchName || 'N/A'}</span>
                      {ev.status === 'completed' && ev.totalScore != null && (
                        <span style={{ color: '#10b981', fontWeight: '600' }}>
                          Score: {ev.totalScore}
                        </span>
                      )}
                      <span style={{ marginLeft: 'auto' }}>
                        {formatDate(ev.updatedAt || ev.assignedDate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
            Showing last {evaluations.length} activities
          </span>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SETTINGS MODAL
// ============================================
const SettingsModal = ({ user, onClose, navigate }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* User Profile */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1f2937' }}>
              Profile Information
            </h3>
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                  Name
                </label>
                <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                  {user?.name || 'N/A'}
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                  Email
                </label>
                <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                  {user?.email || 'N/A'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                  Role
                </label>
                <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500', textTransform: 'capitalize' }}>
                  {user?.role || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1f2937' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  onClose();
                  navigate('/change-password');
                }}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '2px solid #dbeafe',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#dbeafe';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🔐</span>
                Change Password
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/my-evaluations');
                }}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '2px solid #dbeafe',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#dbeafe';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>📝</span>
                View All Evaluations
              </button>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          textAlign: 'right'
        }}>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Add modal styles
const modalStyles = `
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.2s ease-out;
}

.modal-large {
  max-width: 800px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #374151;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-box {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  color: #9ca3af;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = modalStyles;
  document.head.appendChild(styleTag);
}

export default Dashboard;