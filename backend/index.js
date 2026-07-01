const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./Config/db");

// Routes

const productRoutes=require("./Routes/Product")

const authRoutes=require("./Routes/ authRoutes")

const app = express();

dotenv.config();
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Routes



app.use("/api/products",productRoutes);
app.use("/api/auth", authRoutes)

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to E-Commerce API",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});