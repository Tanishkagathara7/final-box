import mongoose from "mongoose";

const groundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: { type: String, required: true },
      cityId: { type: String, required: true },
      cityName: { type: String, required: true },
      state: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      pincode: { type: String, required: true },
    },
    price: {
      ranges: {
        type: [
          {
            start: { type: String, required: true }, // e.g., "06:00"
            end: { type: String, required: true },   // e.g., "18:00"
            perHour: { type: Number, required: true }
          }
        ],
        validate: [arr => arr.length === 2, 'Exactly 2 price ranges are required.']
      },
      currency: { type: String, default: "INR" },
      discount: { type: Number, default: 0 },
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    amenities: [String],
    features: {
      pitchType: {
        type: String,
        enum: ["Artificial Turf", "Synthetic", "Matting", "Concrete"],
        required: true,
      },
      capacity: { type: Number, required: true },
      lighting: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      changeRoom: { type: Boolean, default: false },
      washroom: { type: Boolean, default: false },
      cafeteria: { type: Boolean, default: false },
      equipment: { type: Boolean, default: false },
    },
    availability: {
      timeSlots: [String],
      blockedDates: [Date],
      weeklySchedule: {
        monday: { isOpen: Boolean, slots: [String] },
        tuesday: { isOpen: Boolean, slots: [String] },
        wednesday: { isOpen: Boolean, slots: [String] },
        thursday: { isOpen: Boolean, slots: [String] },
        friday: { isOpen: Boolean, slots: [String] },
        saturday: { isOpen: Boolean, slots: [String] },
        sunday: { isOpen: Boolean, slots: [String] },
      },
    },
    owner: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: { type: String, required: true },
      contact: { type: String, required: true },
      email: { type: String, required: true },
      verified: { type: Boolean, default: false },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      reviews: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended"],
      default: "pending",
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: {
      groundLicense: String,
      ownershipProof: String,
      identityProof: String,
    },
    policies: {
      cancellation: String,
      rules: [String],
      advanceBooking: { type: Number, default: 30 }, // days
    },
  },
  {
    timestamps: true,
  },
);

// Index for location-based queries
groundSchema.index({ "location.latitude": 1, "location.longitude": 1 });
groundSchema.index({ "location.cityId": 1 });
groundSchema.index({ status: 1 });
groundSchema.index({ "rating.average": -1 });

// Method to calculate distance from a given point
groundSchema.methods.calculateDistance = function (lat, lng) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat - this.location.latitude) * Math.PI) / 180;
  const dLng = ((lng - this.location.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.location.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Method to update rating
groundSchema.methods.updateRating = function () {
  if (this.rating.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const totalRating = this.rating.reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );
  this.rating.average = Number(
    (totalRating / this.rating.reviews.length).toFixed(1),
  );
  this.rating.count = this.rating.reviews.length;
};

export default mongoose.model("Ground", groundSchema);
