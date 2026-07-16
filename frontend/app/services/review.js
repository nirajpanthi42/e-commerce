import api from './api'; // your axios instance with baseURL and interceptors

/**
 * Get all reviews for a specific product (public)
 * @param {string} productId
 */
export const getProductReviews = (productId) =>
  api.get(`/reviews/product/${productId}`);

/**
 * Create a new review (authenticated user)
 * @param {Object} data - { productId, rating, comment }
 */
export const createReview = (data) =>
  api.post('/reviews', data); // fixed: removed trailing 's'

/**
 * Update an existing review (owner only)
 * @param {string} reviewId
 * @param {Object} data - { rating, comment }
 */
export const updateReview = (reviewId, data) =>
  api.put(`/reviews/${reviewId}`, data);

/**
 * Delete a review (owner or admin)
 * @param {string} reviewId
 */
export const deleteReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`);

/**
 * Get all reviews (admin only)
 * Used in the admin dashboard.
 */
export const getAllReviews = () =>
  api.get('/reviews');

/**
 * Get reviews by the logged-in user (authenticated user)
 * Used in the user dashboard ("My Reviews").
 */
export const getMyReviews = () =>
  api.get('/reviews/me');