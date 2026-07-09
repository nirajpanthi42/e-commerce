

const express = require("express");

const router = express.Router();
const { register, login } = require("../Controlles/authController");
const { protect } = require("../middleware/authMiddleware");

// ================= Public Routes =================

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// ================= Protected Routes =================

// Get Logged-in User Profile
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
