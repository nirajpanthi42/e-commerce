// backend/Routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Controllers
const {
  getUsers,
  updateUser,
  deleteUser,
  updateUserRole,
} = require('../Controlles/userController');   // fixed spelling

// Routes
router.get('/', protect, admin, getUsers);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;