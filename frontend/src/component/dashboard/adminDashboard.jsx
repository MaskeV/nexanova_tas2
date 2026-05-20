import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
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
          <p className="text-muted">Role: {user?.role}</p>
        </div>

        <div className="cards-grid">
          {isAdmin() && (
            <>
              <div className="card" onClick={() => navigate('/users')}>
                <div className="card-icon">👥</div>
                <h3>User Management</h3>
                <p>Manage admins and evaluators</p>
              </div>

              <div className="card">
                <div className="card-icon">📚</div>
                <h3>Batches</h3>
                <p>Manage evaluation batches</p>
                <span className="badge">Coming Soon</span>
              </div>

              <div className="card">
                <div className="card-icon">💻</div>
                <h3>Technologies</h3>
                <p>Manage technology tracks</p>
                <span className="badge">Coming Soon</span>
              </div>

              <div className="card">
                <div className="card-icon">📊</div>
                <h3>Reports</h3>
                <p>View evaluation reports</p>
                <span className="badge">Coming Soon</span>
              </div>
            </>
          )}

          <div className="card">
            <div className="card-icon">📝</div>
            <h3>My Evaluations</h3>
            <p>View assigned evaluations</p>
            <span className="badge">Coming Soon</span>
          </div>

          <div className="card" onClick={() => navigate('/change-password')}>
            <div className="card-icon">🔒</div>
            <h3>Change Password</h3>
            <p>Update your password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;