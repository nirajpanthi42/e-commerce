const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./Config/db");
const cloudinary = require("./Config/cloudinary");

// Routes
const productRoutes = require("./Routes/Product");
const authRoutes = require("./Routes/authRoutes");
const cartRoutes = require("./Routes/Cart");
const orderRoutes = require("./Routes/Order"); 
const reviewRoutes = require('./Routes/reviewRoutes');
const userRoutes = require('./Routes/userRoutes');

const app = express();

dotenv.config();
connectDB();

// Middleware
app.use(
  cors({
      origin:'https://e-commerce-3-23ca.onrender.com',
    credentials: true,
  })
);

app.use(express.json());



// Routes
app.use("/api/products",productRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/orders",orderRoutes); 
app.use('/api/reviews',reviewRoutes);
app.use('/api/users',userRoutes);

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to E-Commerce API",
  });
});



// 404 Handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`,
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});