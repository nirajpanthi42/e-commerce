const express = require("express");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../Controlles/Cart");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All cart routes require login
router.use(protect);

// Get cart
router.get("/", getCart);

// Add to cart
router.post("/", addToCart);

// Update quantity
router.put("/:productId", updateCartItem);

// Remove product
router.delete("/:productId", removeFromCart);

// Clear cart
router.delete("/", clearCart);

module.exports = router;