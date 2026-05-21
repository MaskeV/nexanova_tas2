// frontend/src/services/participantService.js
import api from './api';

const PARTICIPANT_BASE = '/participants';

// Get all participants
export const getAllParticipants = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    
    const url = params.toString() ? `${PARTICIPANT_BASE}?${params}` : PARTICIPANT_BASE;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get participant by ID
export const getParticipantById = async (participantId) => {
  try {
    const response = await api.get(`${PARTICIPANT_BASE}/${participantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create participant (admin only)
export const createParticipant = async (participantData) => {
  try {
    const response = await api.post(PARTICIPANT_BASE, participantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update participant (admin only)
export const updateParticipant = async (participantId, participantData) => {
  try {
    const response = await api.put(`${PARTICIPANT_BASE}/${participantId}`, participantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete participant (admin only)
export const deleteParticipant = async (participantId) => {
  try {
    const response = await api.delete(`${PARTICIPANT_BASE}/${participantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};