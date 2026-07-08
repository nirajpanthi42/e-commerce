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

const upload = require("../middleware/upload");

const router = express.Router();

// ================= Public Routes =================

// Get all products
// Supports search:
// GET /api/products?search=iphone
router.get("/", getProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// ================= Admin Routes =================

// Create Product (Admin Only)
router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  createProduct
);

// Update Product (Admin Only)
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  updateProduct
);

// Delete Product (Admin Only)
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  deleteProduct
);

module.exports = router;