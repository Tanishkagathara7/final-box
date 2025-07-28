import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { authMiddleware } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const DEFAULT_TIME_SLOTS = [
  "06:00-07:00", "07:00-08:00", "08:00-09:00", "09:00-10:00",
  "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00",
  "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00",
  "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"
];

// Email transporter configuration
const createTransporter = () => {
  // Check if email environment variables are configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  Email configuration not found. Using development mode - OTPs will be logged to console.");
    return null;
  }

  console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
  console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");

  return nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
};

const transporter = createTransporter();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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
        .btn { background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
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
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 BoxCric. All rights reserved.</p>
          <p>Making cricket accessible to everyone, everywhere.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // If transporter is not available (development mode), log OTP to console
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
    // In development, still log the OTP even if email fails
    console.log(`📧 [EMAIL FAILED] OTP for ${email}: ${otp}`);
    throw new Error("Failed to send email. Please try again.");
  }
};

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    // Generate OTP
    const otp = OTP.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await OTP.create({
      email,
      otp,
      purpose: "registration",
      expiresAt,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    // Send OTP email
    await sendOTPEmail(email, otp, "registration");

    // Store user data temporarily (you might want to use Redis for this)
    const tempUserData = { name, email, phone, password };

    res.status(200).json({
      success: true,
      message:
        "OTP sent to your email. Please verify to complete registration.",
      tempToken: jwt.sign(tempUserData, process.env.JWT_SECRET, {
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
router.post("/verify-registration", async (req, res) => {
  try {
    const { email, otp, tempToken } = req.body;

    if (!email || !otp || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and temp token are required",
      });
    }

    // Verify temp token
    let userData;
    try {
      userData = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired registration session",
      });
    }

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      email,
      purpose: "registration",
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No valid OTP found",
      });
    }

    try {
      otpRecord.verifyOTP(otp);
      await otpRecord.save();
    } catch (error) {
      await otpRecord.save(); // Save attempts count
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Create user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      isVerified: true,
    });

    // Generate auth token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
});

// Login with email/phone
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/phone and password are required",
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        location: user.location,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// Request OTP for login (passwordless)
router.post("/request-login-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate OTP
    const otp = OTP.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await OTP.create({
      email,
      otp,
      purpose: "login",
      expiresAt,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    // Send OTP email
    await sendOTPEmail(email, otp, "login");

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Login OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
});

// Verify login OTP
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      email,
      purpose: "login",
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No valid OTP found",
      });
    }

    try {
      otpRecord.verifyOTP(otp);
      await otpRecord.save();
    } catch (error) {
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        location: user.location,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("OTP login verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("bookings");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
});

// Refresh token
router.post("/refresh", authMiddleware, async (req, res) => {
  try {
    const token = generateToken(req.userId);

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
});

// Logout (client-side token removal)
router.post("/logout", authMiddleware, async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
