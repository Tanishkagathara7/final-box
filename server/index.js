import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

// Routes
import testRoutes from "./routes/test.js";
import authRoutes from "./routes/auth.js";
import groundRoutes, { adminRouter as adminGroundsRouter } from "./routes/grounds.js";
import bookingRoutes, { adminRouter as adminBookingsRouter } from "./routes/bookings.js";
import userRoutes from "./routes/users.js";
import paymentsRoutes from "./routes/payments.js";
import { adminRouter as adminLocationsRouter } from "./routes/locations.js";

// Initialize dotenv
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:4000",
      "http://localhost:3000" // Allow React frontend
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

// Cashfree Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';

// Initialize MongoDB connection
let isMongoConnected = false;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    isMongoConnected = true;
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    console.log("⚠️  Running without database connection");
    isMongoConnected = false;
  });

// Add MongoDB connection status to app
app.set("mongoConnected", () => isMongoConnected);

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-ground", (groundId) => {
    socket.join(`ground-${groundId}`);
    console.log(`User joined ground room: ${groundId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

// API Routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/grounds", groundRoutes);
app.use("/api/admin/grounds", adminGroundsRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin/locations", adminLocationsRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "BoxCric API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 BoxCric API server running on port ${PORT}`);
  console.log(`📡 Frontend URL: http://localhost:8080`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  
  // Display Cashfree configuration status
  console.log(`💳 Cashfree Payment Gateway:`);
  if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
    console.log(`   ✅ App ID: ${CASHFREE_APP_ID.substring(0, 8)}...`);
    console.log(`   ✅ Secret Key: ${CASHFREE_SECRET_KEY.substring(0, 8)}...`);
    console.log(`   ✅ API URL: ${CASHFREE_API_URL}`);
  } else {
    console.log(`   ❌ Credentials not configured`);
    console.log(`   ⚠️  Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env file`);
  }
});

export default app;
