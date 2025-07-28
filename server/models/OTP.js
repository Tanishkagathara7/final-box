import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["registration", "login", "password_reset", "email_verification"],
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    userAgent: String,
    ipAddress: String,
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ otp: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 }); // Auto-delete after 10 minutes

// Static method to generate OTP
otpSchema.statics.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Method to verify OTP
otpSchema.methods.verifyOTP = function (inputOTP) {
  if (this.isUsed) {
    throw new Error("OTP has already been used");
  }

  if (this.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }

  if (this.attempts >= 3) {
    throw new Error("Maximum verification attempts exceeded");
  }

  this.attempts += 1;

  if (this.otp !== inputOTP) {
    throw new Error("Invalid OTP");
  }

  this.isUsed = true;
  return true;
};

// Static method to clean expired OTPs
otpSchema.statics.cleanExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount;
};

export default mongoose.model("OTP", otpSchema);
