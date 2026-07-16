const Review = require('../Models/Review');
const Product = require('../Models/Product');

// Create a new review
exports.createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user._id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    return res.status(400).json({ message: 'You already reviewed this product' });
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    comment,
  });

  res.status(201).json(review);
};

// Get all reviews for a product (public)
exports.getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(reviews);
};

// Update own review (only the author can update)
exports.updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  // Check ownership
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this review' });
  }

  const { rating, comment } = req.body;
  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  await review.save();
  res.json(review);
};

// Delete review (owner or admin)
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  // Allow admin or owner
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this review' });
  }

  // .remove() is deprecated in newer Mongoose versions; use deleteOne()
  await review.deleteOne(); // or await Review.findByIdAndDelete(req.params.id)
  res.json({ message: 'Review removed' });
};

// ============================================
// 🆕 Get all reviews (admin only)
// ============================================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name')          // only product name
      .populate('user', 'name email')       // user info
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// 🆕 Get reviews by the logged-in user
// ============================================
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name image')    // product name + image
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};