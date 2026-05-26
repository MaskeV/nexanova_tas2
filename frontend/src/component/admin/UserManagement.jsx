import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';
import '../../styles/Dashboard.css';

const TEMP_PASSWORD = 'Temp@12345';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [lastCreated, setLastCreated] = useState(null); // track newly created user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'evaluator',
    isActive: true,
  });
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditClick = (userItem) => {
    if (userItem.role === 'admin') {
      toast.error('You cannot edit admin users');
      return;
    }
    setEditingUser(userItem);
    setFormData({
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
      isActive: userItem.isActive,
    });
    setLastCreated(null);
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setLastCreated(null);
    setFormData({ name: '', email: '', role: 'evaluator', isActive: true });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const dataToSubmit = { ...formData, role: 'evaluator' };

    try {
      if (editingUser) {
        if (editingUser.role === 'admin') {
          toast.error('You cannot edit admin users');
          return;
        }
        const response = await authAPI.updateUser(editingUser._id, dataToSubmit);
        if (response.data.success) {
          toast.success('User updated successfully');
          loadUsers();
          setShowModal(false);
        }
      } else {
        const response = await authAPI.register({
          ...dataToSubmit,
          password: TEMP_PASSWORD,
        });
        if (response.data.success) {
          toast.success('Evaluator created successfully');
          setLastCreated({ name: formData.name, email: formData.email });
          loadUsers();
          // Keep modal open to show credentials
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error('Error:', error);
    }
  };

  const handleDeleteClick = async (userId) => {
    const userToDelete = users.find(u => u._id === userId);
    if (userId === user._id) { toast.error('Cannot delete your own account'); return; }
    if (userToDelete?.role === 'admin') { toast.error('You cannot delete admin users'); return; }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await authAPI.deleteUser(userId);
        if (response.data.success) {
          toast.success('User deleted successfully');
          loadUsers();
        }
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-brand"><h2>User Management</h2></div>
        </nav>
        <div className="loading-container" style={{ justifyContent: 'center' }}>
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand"><h2>User Management</h2></div>
        <div className="navbar-menu">
          <span className="user-info">{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">All Users ({filteredUsers.length})</h3>
            <div className="table-search">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="evaluator">Evaluator</option>
              </select>
              <button className="btn btn-primary" onClick={handleCreateClick}>
                + New Evaluator
              </button>
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="table-content">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                        {u._id === user._id && (
                          <span className="badge" style={{ marginLeft: '8px' }}>You</span>
                        )}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-success' : ''}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleEditClick(u)}
                            disabled={u.role === 'admin'}
                            title={u.role === 'admin' ? 'Cannot edit admin users' : 'Edit user'}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeleteClick(u._id)}
                            disabled={u._id === user._id || u.role === 'admin'}
                            title={
                              u._id === user._id ? 'Cannot delete yourself'
                              : u.role === 'admin' ? 'Cannot delete admin users'
                              : 'Delete user'
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-2xl)',
            maxWidth: '500px', width: '90%',
            maxHeight: '90vh', overflow: 'auto',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
              {editingUser ? 'Edit Evaluator' : lastCreated ? '✅ Evaluator Created' : 'Create New Evaluator'}
            </h2>

            {/* Show credentials after successful creation */}
            {lastCreated && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <p style={{ fontWeight: '600', color: '#15803d', marginBottom: '8px' }}>
                  Share these login credentials with the user:
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Email:</strong> {lastCreated.email}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Temporary Password:</strong>{' '}
                  <code style={{
                    backgroundColor: '#dcfce7', padding: '2px 8px',
                    borderRadius: '4px', fontWeight: 'bold', letterSpacing: '1px'
                  }}>
                    {TEMP_PASSWORD}
                  </code>
                </p>
                <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>
                  The user should change their password after first login.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={() => setShowModal(false)}
                >
                  Done
                </button>
              </div>
            )}

            {/* Hide form once created */}
            {!lastCreated && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text" name="name"
                    value={formData.name} onChange={handleInputChange}
                    required placeholder="Enter evaluator name"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email" name="email"
                    value={formData.email} onChange={handleInputChange}
                    required placeholder="Enter email address"
                    disabled={!!editingUser}
                  />
                </div>

                <input type="hidden" name="role" value="evaluator" />

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox" name="isActive"
                      checked={formData.isActive} onChange={handleInputChange}
                    />
                    {' '}Active Account
                  </label>
                </div>

                {!editingUser && (
                  <div style={{
                    backgroundColor: '#f0f9ff', padding: '12px',
                    borderRadius: '8px', marginBottom: 'var(--spacing-lg)',
                    fontSize: '14px', color: '#0369a1'
                  }}>
                    <strong>Temporary password:</strong>{' '}
                    <code style={{ backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                      {TEMP_PASSWORD}
                    </code>
                    <br />
                    <span style={{ fontSize: '12px' }}>
                      You will be shown this again after creation to share with the user.
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: 'var(--spacing-lg)' }}>
                  <button
                    type="button" className="btn btn-secondary"
                    onClick={() => setShowModal(false)} style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;