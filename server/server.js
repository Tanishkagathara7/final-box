import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

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

// ============================================================================
// DATABASE MODELS
// ============================================================================

// User Model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String, default: null },
    location: {
      cityId: String,
      cityName: String,
      state: String,
      latitude: Number,
      longitude: Number,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        marketing: { type: Boolean, default: false },
      },
      language: { type: String, default: "english" },
      currency: { type: String, default: "INR" },
      darkMode: { type: Boolean, default: false },
    },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    favoriteGrounds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ground" }],
    role: { type: String, enum: ["user", "admin", "ground_owner"], default: "user" },
    totalBookings: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return candidatePassword === this.password;
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);

// OTP Model
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["registration", "login", "password_reset", "email_verification"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: true }
);

otpSchema.statics.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const OTP = mongoose.model("OTP", otpSchema);

// Location Model
const locationSchema = new mongoose.Schema(
  {
    cityId: { type: String, required: true, unique: true },
    cityName: { type: String, required: true },
    state: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationSchema);

// Ground Model
const groundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: {
      cityId: { type: String, required: true },
      cityName: { type: String, required: true },
      address: { type: String, required: true },
      latitude: Number,
      longitude: Number,
    },
    images: [String],
    amenities: [String],
    pricing: {
      hourlyRate: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    timeSlots: [String],
    isActive: { type: Boolean, default: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Ground = mongoose.model("Ground", groundSchema);

// Booking Model
const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ground: { type: mongoose.Schema.Types.ObjectId, ref: "Ground", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    duration: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: String,
    bookingId: { type: String, unique: true },
    notes: String,
  },
  { timestamps: true }
);

bookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    this.bookingId = "BK" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:4000", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production');
      const user = await User.findById(decoded.userId);
      if (user) {
        req.userId = user._id;
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

const adminMiddleware = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';
let isMongoConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    isMongoConnected = true;
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    console.log("⚠️  Running without database connection");
    isMongoConnected = false;
  });

app.set("mongoConnected", () => isMongoConnected);

// Cashfree Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';

// Email Configuration
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  Email configuration not found. Using development mode - OTPs will be logged to console.");
    return null;
  }
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'default-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose) => {
  const subject = {
    registration: "BoxCric - Verify Your Registration",
    login: "BoxCric - Login Verification Code",
    password_reset: "BoxCric - Password Reset Code",
    email_verification: "BoxCric - Email Verification",
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%); padding: 20px; text-align: center; }
        .logo { color: white; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; text-align: center; }
        .otp-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 5px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏏 BoxCric</div>
          <p style="color: white; margin: 10px 0 0 0;">Book. Play. Win.</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937;">Verification Code</h2>
          <p style="color: #4b5563;">Use this code to ${purpose.replace("_", " ")} your BoxCric account:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes. Do not share this code with anyone.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 BoxCric. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`📧 [DEVELOPMENT MODE] OTP for ${email}:`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   OTP: ${otp}`);
    console.log(`   Subject: ${subject[purpose]}`);
    console.log(`   ─────────────────────────────────────────`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject[purpose],
      html: htmlContent,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    console.log(`📧 [EMAIL FAILED] OTP for ${email}: ${otp}`);
    throw new Error("Failed to send email. Please try again.");
  }
};

const DEFAULT_TIME_SLOTS = [
  "06:00-07:00", "07:00-08:00", "08:00-09:00", "09:00-10:00",
  "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00",
  "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00",
  "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"
];

// ============================================================================
// SOCKET.IO SETUP
// ============================================================================

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

app.set("io", io);

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    const otp = OTP.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email,
      otp,
      purpose: "registration",
      expiresAt,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    await sendOTPEmail(email, otp, "registration");

    const tempUserData = { name, email, phone, password };

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      tempToken: jwt.sign(tempUserData, process.env.JWT_SECRET || 'default-secret-key', {
        expiresIn: "15m",
      }),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// Verify registration OTP
app.post("/api/auth/verify-registration", async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({
        success: false,
        message: "Token and OTP are required",
      });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'default-secret-key');
    const { name, email, phone, password } = decoded;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose: "registration",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      isVerified: true,
    });

    await user.save();
    await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// Get current user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("bookings favoriteGrounds");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
  }
});

// ============================================================================
// GROUNDS ROUTES
// ============================================================================

// Get all grounds
app.get("/api/grounds", optionalAuth, async (req, res) => {
  try {
    const { cityId, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (cityId) {
      query["location.cityId"] = cityId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const grounds = await Ground.find(query)
      .populate("owner", "name email phone")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Ground.countDocuments(query);

    res.status(200).json({
      success: true,
      grounds,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + grounds.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get grounds error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch grounds",
    });
  }
});

// Get ground by ID
app.get("/api/grounds/:id", optionalAuth, async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id)
      .populate("owner", "name email phone")
      .populate({
        path: "rating",
        select: "average count",
      });

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    res.status(200).json({
      success: true,
      ground,
    });
  } catch (error) {
    console.error("Get ground error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ground",
    });
  }
});

// Create ground (Admin/Owner only)
app.post("/api/grounds", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      images,
      amenities,
      pricing,
      timeSlots = DEFAULT_TIME_SLOTS,
    } = req.body;

    if (!name || !description || !location || !pricing) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const ground = new Ground({
      name,
      description,
      location,
      images: images || [],
      amenities: amenities || [],
      pricing,
      timeSlots,
      owner: req.userId,
    });

    await ground.save();

    res.status(201).json({
      success: true,
      message: "Ground created successfully",
      ground,
    });
  } catch (error) {
    console.error("Create ground error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ground",
    });
  }
});

// Update ground
app.put("/api/grounds/:id", authMiddleware, async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id);

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    if (ground.owner.toString() !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this ground",
      });
    }

    const updatedGround = await Ground.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Ground updated successfully",
      ground: updatedGround,
    });
  } catch (error) {
    console.error("Update ground error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ground",
    });
  }
});

// Delete ground
app.delete("/api/grounds/:id", authMiddleware, async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id);

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    if (ground.owner.toString() !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this ground",
      });
    }

    await Ground.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Ground deleted successfully",
    });
  } catch (error) {
    console.error("Delete ground error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete ground",
    });
  }
});

// ============================================================================
// BOOKINGS ROUTES
// ============================================================================

// Create booking
app.post("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const { groundId, date, timeSlot, duration = 1, notes } = req.body;

    if (!groundId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Ground ID, date, and time slot are required",
      });
    }

    const ground = await Ground.findById(groundId);
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    // Check if time slot is available
    const bookingDate = new Date(date);
    const existingBooking = await Booking.findOne({
      ground: groundId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
      },
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const totalAmount = ground.pricing.hourlyRate * duration;

    const booking = new Booking({
      user: req.userId,
      ground: groundId,
      date: bookingDate,
      timeSlot,
      duration,
      totalAmount,
      notes,
    });

    await booking.save();

    // Update user's total bookings
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalBookings: 1 },
      $push: { bookings: booking._id },
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
});

// Get user bookings
app.get("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.userId };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("ground", "name location images")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + bookings.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});

// Get booking by ID
app.get("/api/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("ground", "name location images pricing")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user._id.toString() !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
});

// Cancel booking
app.put("/api/bookings/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
});

// ============================================================================
// LOCATIONS ROUTES
// ============================================================================

// Get all locations
app.get("/api/locations", async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ cityName: 1 });
    res.status(200).json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
});

// ============================================================================
// PAYMENTS ROUTES
// ============================================================================

// Create payment order
app.post("/api/payments/create-order", authMiddleware, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and amount are required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay for this booking",
      });
    }

    // Cashfree payment order creation
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: req.userId.toString(),
        customer_name: req.user.name,
        customer_email: req.user.email,
        customer_phone: req.user.phone,
      },
      order_meta: {
        booking_id: bookingId,
        ground_name: booking.ground.name,
      },
    };

    const response = await fetch(`${CASHFREE_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create payment order");
    }

    res.status(200).json({
      success: true,
      order: result,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
});

// Payment webhook
app.post("/api/payments/webhook", async (req, res) => {
  try {
    const { order_id, order_amount, order_currency, order_status, payment_id } = req.body;

    if (order_status === "PAID") {
      const booking = await Booking.findOne({ "bookingId": order_id });
      if (booking) {
        booking.paymentStatus = "paid";
        booking.paymentId = payment_id;
        booking.status = "confirmed";
        await booking.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Payment webhook error:", error);
    res.status(500).json({ success: false });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Get all bookings (Admin)
app.get("/api/admin/bookings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("ground", "name location")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + bookings.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Admin get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});

// Update booking status (Admin)
app.put("/api/admin/bookings/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email phone").populate("ground", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Admin update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
});

// ============================================================================
// TEST ROUTES
// ============================================================================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test endpoint working!",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// HEALTH CHECK & ERROR HANDLING
// ============================================================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "BoxCric API is running!",
    timestamp: new Date().toISOString(),
    mongoConnected: isMongoConnected,
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

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 BoxCric API server running on port ${PORT}`);
  console.log(`📡 Frontend URL: http://localhost:8080`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  
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