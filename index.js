import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// test routes FIRST
app.get("/", (req, res) => {
  res.send("API is working");
});

//test route
app.get("/health", (req, res) => {
  res.send("Backend server is running");
});

// env check
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URL || !JWT_SECRET) {
  console.log("Missing env variables");
  process.exit(1);
}

connectDB();

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
