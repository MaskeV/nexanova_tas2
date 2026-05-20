import express from 'express';
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register); // Public signup for evaluators

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// Admin only routes
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;