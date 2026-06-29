const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/db");
const productRoutes = require("./Routes/Product");
const authRoutes=require("./Routes/ authRoutes")

const cors = require("cors");
const app = express();

dotenv.config();

connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);



app.use(express.json());

app.use("/api/products",productRoutes);
app.use("/api/auth",authRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

