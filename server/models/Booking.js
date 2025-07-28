import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groundId: {
      type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      duration: { type: Number, required: true }, // in hours
    },
    playerDetails: {
      teamName: String,
      playerCount: { type: Number, required: true },
      contactPerson: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
      },
      requirements: String,
    },
    pricing: {
      baseAmount: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    payment: {
      paymentId: String,
      cashfreeOrderId: String,
      cashfreePaymentSessionId: String,
      paymentDetails: Object,
      method: {
        type: String,
        enum: ["card", "netbanking", "wallet", "upi", "offline"],
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      paidAt: Date,
      refundAmount: { type: Number, default: 0 },
      refundedAt: Date,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      default: "pending",
    },
    cancellation: {
      cancelledBy: {
        type: String,
        enum: ["user", "admin", "system"],
      },
      cancelledAt: Date,
      reason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
      },
    },
    confirmation: {
      confirmedAt: Date,
      confirmationCode: String,
      groundOwnerNotified: { type: Boolean, default: false },
    },
    checkin: {
      checkedInAt: Date,
      checkedInBy: String,
      actualPlayerCount: Number,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date,
    },
    notifications: {
      reminderSent: { type: Boolean, default: false },
      confirmationSent: { type: Boolean, default: false },
      feedbackRequested: { type: Boolean, default: false },
    },
    special: {
      isRecurring: { type: Boolean, default: false },
      recurringPattern: String, // weekly, monthly
      parentBookingId: String,
      notes: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
bookingSchema.index({ userId: 1, bookingDate: -1 });
bookingSchema.index({ groundId: 1, bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ "payment.status": 1 });
bookingSchema.index({ bookingId: 1 });

// Compound index for overlap checking
bookingSchema.index({ 
  groundId: 1, 
  bookingDate: 1, 
  status: 1,
  "timeSlot.startTime": 1,
  "timeSlot.endTime": 1
});

// Generate unique booking ID
bookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `BC${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
  if (this.status !== "confirmed") return false;

  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const [startHour, startMinute] = this.timeSlot.startTime
    .split(":")
    .map(Number);
  bookingDateTime.setHours(startHour, startMinute);

  // Allow cancellation up to 4 hours before the booking
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  return hoursUntilBooking >= 4;
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function () {
  if (!this.canBeCancelled()) return 0;

  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const [startHour, startMinute] = this.timeSlot.startTime
    .split(":")
    .map(Number);
  bookingDateTime.setHours(startHour, startMinute);

  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

  if (hoursUntilBooking >= 4) {
    return this.pricing.totalAmount; // Full refund
  } else if (hoursUntilBooking >= 2) {
    return this.pricing.totalAmount * 0.5; // 50% refund
  }

  return 0; // No refund
};

// Virtual for formatted booking date
bookingSchema.virtual("formattedDate").get(function () {
  return this.bookingDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for time slot display
bookingSchema.virtual("timeSlotDisplay").get(function () {
  return `${this.timeSlot.startTime} - ${this.timeSlot.endTime}`;
});

export default mongoose.model("Booking", bookingSchema);
