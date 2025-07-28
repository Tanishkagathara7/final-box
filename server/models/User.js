import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
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
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    favoriteGrounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ground",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin", "ground_owner"],
      default: "user",
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return candidatePassword === this.password;
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model("User", userSchema);
