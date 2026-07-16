const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews,   // <-- new
  getMyReviews,    // <-- new
} = require('../Controlles/reviewController');

// Public
router.get('/product/:productId', getProductReviews);

// Authenticated user routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/me', protect, getMyReviews);      // <-- new

// Admin only
router.get('/', protect, admin, getAllReviews); // <-- new

module.exports = router;