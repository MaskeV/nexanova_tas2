// frontend/src/component/MockEvaluation/ParticipantManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getAllParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from '../../services/participantService';
import PageLayout from './PageLayout';
import './MockEvaluation.css';

const ParticipantManagement = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await getAllParticipants();
      setParticipants(res.data || []);
      console.log('✅ Participants loaded:', res.data?.length);
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch participants');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      if (editingParticipant) {
        await updateParticipant(editingParticipant.participantId, formData);
        toast.success('Participant updated successfully!');
      } else {
        await createParticipant(formData);
        toast.success('Participant created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchParticipants();
    } catch (error) {
      console.error('❌ Error saving participant:', error);
      toast.error(error.response?.data?.message || 'Failed to save participant');
    }
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setFormData({
      name: participant.name,
      email: participant.email,
      phone: participant.phone || '',
      isActive: participant.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (participantId) => {
    if (!window.confirm('Are you sure you want to delete this participant?')) return;
    try {
      await deleteParticipant(participantId);
      toast.success('Participant deleted successfully!');
      fetchParticipants();
    } catch (error) {
      console.error('❌ Error deleting participant:', error);
      toast.error(error.response?.data?.message || 'Failed to delete participant');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', isActive: true });
    setEditingParticipant(null);
  };

  // Filter participants based on search and active status
  const filteredParticipants = participants.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone && p.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && p.isActive) ||
      (filterActive === 'inactive' && !p.isActive);
    return matchesSearch && matchesFilter;
  });

  if (loading && participants.length === 0) {
    return (
      <PageLayout title="👥 Participant Management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading participants...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="👥 Participant Management">
      <div className="batch-management">
        {/* Header */}
        <div className="page-header">
          <h1>👥 Participant Management</h1>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            + Add Participant
          </button>
        </div>

        {/* Search & Filters */}
        <div className="filters-section">
          <div className="filter-group" style={{ flex: 2 }}>
            <label>SEARCH:</label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                outline: 'none',
                cursor: 'text',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div className="filter-group">
            <label>STATUS:</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => { setSearchTerm(''); setFilterActive('all'); }}
          >
            Clear Filters
          </button>
        </div>

        {/* Results Summary */}
        {searchTerm || filterActive !== 'all' ? (
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
            Showing {filteredParticipants.length} of {participants.length} participants
          </div>
        ) : null}

        {/* Participants Table */}
        <div className="table-container">
          {filteredParticipants.length === 0 ? (
            <div className="empty-state">
              <p>
                {participants.length === 0
                  ? 'No participants yet. Add your first participant!'
                  : 'No participants match your filters.'}
              </p>
            </div>
          ) : (
            <table className="eval-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map(participant => (
                  <tr key={participant._id}>
                    <td>
                      <strong>{participant.name}</strong>
                    </td>
                    <td>{participant.email}</td>
                    <td>{participant.phone || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          participant.isActive ? 'badge-success' : 'badge-secondary'
                        }`}
                      >
                        {participant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {participant.createdAt
                        ? new Date(participant.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(participant)}
                          style={{
                            backgroundColor: '#e2e8f0',
                            color: '#475569',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(participant.participantId)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
                </h2>
                <button className="btn-close" onClick={() => setShowModal(false)}>
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., john@example.com"
                    disabled={!!editingParticipant}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingParticipant ? 'Update Participant' : 'Add Participant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ParticipantManagement;