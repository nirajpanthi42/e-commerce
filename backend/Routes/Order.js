// backend/Routes/Order.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus, 
  cancelOrder
} = require('../Controlles/orderController');

// ================================================================
// DEBUG ROUTES (for testing)
// ================================================================

// GET /api/orders/auth - Test authentication
router.get('/auth', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// GET /api/orders/admin - Test admin access
router.get('/admin', protect, admin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access working',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ================================================================
// MAIN ROUTES
// ================================================================

// GET /api/orders - Get all orders (admin only)
router.get('/', protect, admin, getAllOrders);

// GET /api/orders/user - Get logged-in user's orders
router.get('/user', protect, getUserOrders);

// POST /api/orders - Create a new order
router.post('/', protect, createOrder);

// GET /api/orders/:id - Get single order by ID
router.get('/:id', protect, getOrderById);

// PATCH /api/orders/:id/status - Update order status (admin only)
router.patch('/:id/status', protect, admin, updateOrderStatus);  // ← This is the route

// PATCH /api/orders/:id/cancel - Cancel order
router.patch('/:id/cancel', protect, cancelOrder);

module.exports = router;