const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../Controlles/Product");

const {
  protect,
  restrictTo,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ================= Public Routes =================

// Anyone can view all products
router.get("/", getProducts);

// Anyone can view a single product
router.get("/:id", getProductById);

// ================= Admin Routes =================

// Create Product (Admin Only)
router.post("/", protect, restrictTo("admin"), createProduct);

// Update Product (Admin Only)
router.put("/:id", protect, restrictTo("admin"), updateProduct);

// Delete Product (Admin Only)
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);

module.exports = router;