import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/authContext';

import Login from './component/auth/login';
import Signup from './component/auth/Signup';
import AdminDashboard from './component/dashboard/AdminDashboard';
import Dashboard from './component/dashboard/Dashboard';
import UserManagement from './component/admin/UserManagement';
import ChangePassword from './component/auth/ChangePassword';

// MockEvaluation modules
import BatchManagement from './component/MockEvaluation/BatchManagement';
import TechnologyManagement from './component/MockEvaluation/TechnologyManagement';
import EvaluationManagement from './component/MockEvaluation/EvaluationManagement';
import EvaluatorDashboard from './component/MockEvaluation/EvaluatorDashboard';
import ReportsDashboard from './component/MockEvaluation/ReportsDashboard';

// ── Spinner ───────────────────────────────────────────────
const LoadingSpinner = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #e0f4ff 0%, #bae6fd 40%, #7dd3fc 100%)',
    gap: '1rem',
  }}>
    <div style={{
      width: 44, height: 44,
      border: '4px solid #bae6fd',
      borderTopColor: '#0ea5e9',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <p style={{ color: '#0369a1', fontWeight: 500 }}>Loading...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Guards ────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const EvaluatorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  // Both admin and evaluator can access evaluator views
  return children;
};

// ── Smart dashboard: picks component based on role ────────
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  return <Dashboard />;
};

// ── Routes ────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

    {/* Protected (any authenticated user) */}
    <Route path="/dashboard"       element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
    <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

    {/* Evaluator features (evaluator + admin) */}
    <Route path="/my-evaluations"  element={<EvaluatorRoute><EvaluatorDashboard /></EvaluatorRoute>} />

    {/* Admin only */}
    <Route path="/users"           element={<AdminRoute><UserManagement /></AdminRoute>} />
    <Route path="/batches"         element={<AdminRoute><BatchManagement /></AdminRoute>} />
    <Route path="/technologies"    element={<AdminRoute><TechnologyManagement /></AdminRoute>} />
    <Route path="/evaluations"     element={<AdminRoute><EvaluationManagement /></AdminRoute>} />
    <Route path="/reports"         element={<AdminRoute><ReportsDashboard /></AdminRoute>} />

    {/* Catch-all */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

// ── App ───────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;