import express from "express";
import { fallbackGrounds } from "../data/fallbackGrounds.js";
import { authMiddleware } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import Ground from "../models/Ground.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { 
  doTimeRangesOverlap, 
  validateTimeSlot, 
  validateBookingDate, 
  validateTimeSlotForToday,
  calculateDuration, 
  generateBookingId 
} from "../lib/bookingUtils.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Utility to calculate pricing
export function getPricing(ground, timeSlot) {
  let duration = 1;
  let perHour = ground.price?.perHour || 500;
  if (timeSlot && typeof timeSlot === "object" && timeSlot.duration) {
    duration = Number(timeSlot.duration) || 1;
  }
  // If price ranges exist, pick the correct perHour based on startTime
  if (Array.isArray(ground.price?.ranges) && ground.price.ranges.length > 0 && timeSlot?.startTime) {
    const startHour = parseInt(timeSlot.startTime.split(':')[0]);
    const slot = ground.price.ranges.find(r => {
      const rangeStart = parseInt(r.start.split(':')[0]);
      const rangeEnd = parseInt(r.end.split(':')[0]);
      
      // Handle overnight ranges (e.g., 18:00-06:00)
      if (rangeStart > rangeEnd) {
        return startHour >= rangeStart || startHour < rangeEnd;
      } else {
        return startHour >= rangeStart && startHour < rangeEnd;
      }
    });
    
    if (slot) {
      perHour = slot.perHour;
    } else {
      // fallback: pick the first range
      perHour = ground.price.ranges[0].perHour;
    }
  }
  const baseAmount = perHour * duration;
  const discount = ground.price?.discount || 0;
  const discountedAmount = baseAmount - discount;
  const convenienceFee = Math.round(discountedAmount * 0.02); // 2% convenience fee
  const totalAmount = discountedAmount + convenienceFee;
  return {
    baseAmount,
    discount,
    taxes: convenienceFee, // Changed to match Booking schema
    totalAmount,
    duration,
  };
}

// Create a booking (authenticated)
router.post("/", authMiddleware, async (req, res) => {
  // Check if MongoDB is connected
  const isMongoConnected = req.app.get("mongoConnected")();
  if (!isMongoConnected) {
    return res.status(503).json({ 
      success: false, 
      message: "Database connection is not available. Please try again later." 
    });
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (sessionError) {
    console.error("Failed to create MongoDB session:", sessionError);
    return res.status(503).json({ 
      success: false, 
      message: "Database session creation failed. Please try again." 
    });
  }
  
  try {
    const { groundId, bookingDate, timeSlot, playerDetails, requirements } = req.body;
    const userId = req.userId;

    console.log("Booking creation request:", {
      groundId,
      bookingDate,
      timeSlot,
      playerDetails,
      requirements,
      userId
    });

    // Validate groundId is a MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(groundId)) {
      return res.status(400).json({ success: false, message: "This ground cannot be booked online." });
    }

    // Validate required fields
    if (!groundId || !bookingDate || !timeSlot || !playerDetails) {
      console.log("Missing required fields:", {
        groundId: !!groundId,
        bookingDate: !!bookingDate,
        timeSlot: !!timeSlot,
        playerDetails: !!playerDetails
      });
      console.log("Request body:", req.body);
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields",
        details: {
          groundId: !!groundId,
          bookingDate: !!bookingDate,
          timeSlot: !!timeSlot,
          playerDetails: !!playerDetails
        }
      });
    }

    // Validate player details
    if (!playerDetails.contactPerson || !playerDetails.contactPerson.name || !playerDetails.contactPerson.phone) {
      return res.status(400).json({
        success: false,
        message: "Contact person name and phone are required"
      });
    }

    if (!playerDetails.playerCount || playerDetails.playerCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of players must be at least 1"
      });
    }

    // Validate time slot format
    console.log("Validating time slot:", timeSlot);
    const timeSlotValidation = validateTimeSlot(timeSlot);
    console.log("Time slot validation result:", timeSlotValidation);
    if (!timeSlotValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: timeSlotValidation.error
      });
    }

    // Validate booking date
    const dateValidation = validateBookingDate(bookingDate);
    if (!dateValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.error
      });
    }

    // Validate time slot for today (if booking is for today)
    const todayValidation = validateTimeSlotForToday(timeSlot, bookingDate);
    if (!todayValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: todayValidation.error
      });
    }

    // Check if ground exists - handle both MongoDB and fallback grounds
    let ground = null;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(groundId);
    
    console.log("Ground ID validation:", { groundId, isValidObjectId });
    
    if (isValidObjectId) {
      // Try to find in MongoDB
      try {
        ground = await Ground.findById(groundId);
        console.log("MongoDB ground found:", !!ground);
      } catch (groundError) {
        console.error("Error finding ground in MongoDB:", groundError);
        // Continue to fallback
      }
    }
    
    // If not found in MongoDB, check fallback data
    if (!ground) {
      ground = fallbackGrounds.find(g => g._id === groundId);
      console.log("Fallback ground found:", !!ground);
    }
    
    if (!ground) {
      console.log("No ground found for ID:", groundId);
      return res.status(400).json({ 
        success: false, 
        message: "Ground not found" 
      });
    }

    console.log("Ground found:", ground.name);

    // Check ground capacity
    if (ground.features && ground.features.capacity && playerDetails.playerCount > ground.features.capacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${ground.features.capacity} players allowed for this ground`
      });
    }

    // Parse time slot (format: "10:00-12:00")
    const [startTime, endTime] = timeSlot.split("-");
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const duration = calculateDuration(startTime, endTime);

    console.log("Time slot parsing:", { startTime, endTime, duration });

    // Check if slot is already booked (only for MongoDB grounds)
    if (isValidObjectId) {
      try {
        // Find any booking that overlaps with the requested slot
        const existingBookings = await Booking.find({
          groundId,
          bookingDate: new Date(bookingDate),
          status: { $in: ["pending", "confirmed"] }
        }).session(session);

        // Check for overlaps using JavaScript logic
        console.log(`Checking for overlaps with ${existingBookings.length} existing bookings`);
        const overlappingBooking = existingBookings.find(booking => {
          const bookingStart = new Date(`2000-01-01 ${booking.timeSlot.startTime}`);
          const bookingEnd = new Date(`2000-01-01 ${booking.timeSlot.endTime}`);
          
          const hasOverlap = start < bookingEnd && end > bookingStart;
          if (hasOverlap) {
            console.log(`Found overlap: New booking (${startTime}-${endTime}) overlaps with existing booking (${booking.timeSlot.startTime}-${booking.timeSlot.endTime})`);
          }
          
          return hasOverlap;
        });

        if (overlappingBooking) {
          console.log("Slot overlaps with an existing booking:", overlappingBooking.bookingId);
          return res.status(400).json({ 
            success: false, 
            message: `This time slot (${startTime}-${endTime}) overlaps with an existing booking (${overlappingBooking.timeSlot.startTime}-${overlappingBooking.timeSlot.endTime}). Please select a different time.` 
          });
        }
      } catch (overlapError) {
        console.error("Error checking for overlaps:", overlapError);
        return res.status(500).json({ 
          success: false, 
          message: "Error checking booking availability. Please try again." 
        });
      }
    }

    // Calculate pricing
    const { baseAmount, discount, taxes, totalAmount, duration: calcDuration } = getPricing(ground, { startTime, endTime, duration });

    console.log("Pricing calculation:", { baseAmount, discount, taxes, totalAmount });

    // Generate unique booking ID
    const bookingId = generateBookingId();

    // Create booking
    const booking = new Booking({
      bookingId,
      userId,
      groundId,
      bookingDate: new Date(bookingDate),
      timeSlot: {
        startTime,
        endTime,
        duration
      },
      playerDetails: {
        teamName: playerDetails.teamName,
        playerCount: playerDetails.playerCount,
        contactPerson: playerDetails.contactPerson,
        requirements
      },
      pricing: {
        baseAmount,
        discount,
        taxes,
        totalAmount,
        currency: "INR"
      },
      status: "pending"
    });

    console.log("Saving booking...");
    try {
      await booking.save({ session });
      console.log("Booking saved successfully");
    } catch (saveError) {
      console.error("Error saving booking:", saveError);
      throw new Error(`Failed to save booking: ${saveError.message}`);
    }

    // Populate ground details if it's a MongoDB ground
    if (isValidObjectId) {
      try {
        await booking.populate("groundId", "name location price features");
      } catch (populateError) {
        console.error("Error populating ground details:", populateError);
        // Continue without population
      }
    } else {
      // For fallback grounds, manually add ground details
      booking.groundId = ground;
    }

    console.log("Booking created successfully:", booking.bookingId);
    
    try {
      await session.commitTransaction();
      res.json({ 
        success: true, 
        booking: booking.toObject() 
      });
    } catch (commitError) {
      console.error("Error committing transaction:", commitError);
      throw new Error(`Failed to commit booking transaction: ${commitError.message}`);
    }

  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Failed to abort transaction:", abortError);
      }
    }
    console.error("Error creating booking:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  } finally {
    if (session) {
      try {
        session.endSession();
      } catch (endSessionError) {
        console.error("Failed to end session:", endSessionError);
      }
    }
  }
});

// Get user's bookings (authenticated)
router.get("/my-bookings", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Process bookings to handle both MongoDB and fallback grounds
    const processedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        // Check if groundId is a valid ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingObj.groundId);
        
        if (isValidObjectId) {
          // Populate from MongoDB
          await booking.populate("groundId", "name location price features");
          bookingObj.groundId = booking.groundId;
        } else {
          // Find in fallback data
          const fallbackGround = fallbackGrounds.find(g => g._id === bookingObj.groundId);
          if (fallbackGround) {
            bookingObj.groundId = fallbackGround;
          }
        }
        
        return bookingObj;
      })
    );

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings: processedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    });
  }
});

// Get booking details by ID (authenticated)
router.get('/owner', authMiddleware, async (req, res) => {
  try {
    console.log("[GET /bookings/owner] Incoming request");
    const user = req.user;
    console.log("[GET /bookings/owner] User:", user);
    if (!user || user.role !== 'ground_owner') {
      console.log("[GET /bookings/owner] Access denied: not a ground owner");
      return res.status(403).json({ success: false, message: 'Access denied. Not a ground owner.' });
    }
    // Find all grounds owned by this user
    const grounds = await Ground.find({ 'owner.userId': req.userId });
    console.log("[GET /bookings/owner] Grounds found:", grounds.length);
    // Use string form of ground IDs for $in query
    const groundIds = grounds.map(g => g._id.toString());
    const bookings = await Booking.find({ groundId: { $in: groundIds } })
      .populate('userId', 'name email')
      .populate('groundId', 'name location');
    console.log("[GET /bookings/owner] Bookings found:", bookings.length);
    if (bookings.length === 0) {
      // Print all bookings for debugging
      const allBookings = await Booking.find({});
      console.log("All bookings in DB:", allBookings.map(b => ({
        _id: b._id,
        groundId: b.groundId,
        groundIdType: typeof b.groundId,
        bookingId: b.bookingId
      })));
    }
    res.json({ success: true, bookings });
  } catch (error) {
    console.error("[GET /bookings/owner] Error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
});

// GET /api/bookings/owner/notifications - get notifications for ground owner
router.get("/owner/notifications", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ground_owner') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get owner's grounds
    const ownerGrounds = await Ground.find({ ownerId: decoded.userId });
    const groundIds = ownerGrounds.map(g => g._id);

    // Get recent bookings (last 24 hours) for owner's grounds
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentBookings = await Booking.find({
      groundId: { $in: groundIds },
      createdAt: { $gte: yesterday }
    })
    .populate('userId', 'name email')
    .populate('groundId', 'name location')
    .sort({ createdAt: -1 })
    .limit(10);

    // Format notifications
    const notifications = recentBookings.map(booking => ({
      id: booking._id,
      type: 'new_booking',
      title: 'New Booking',
      message: `Booking for ${booking.groundId.name} on ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.timeSlot.startTime}-${booking.timeSlot.endTime}`,
      booking: booking,
      timestamp: booking.createdAt,
      read: false
    }));

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;
    if (!bookingId || bookingId === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }
    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    const bookingObj = booking.toObject();
    
    // Check if groundId is a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingObj.groundId);
    
    if (isValidObjectId) {
      // Populate from MongoDB
      await booking.populate("groundId", "name location price features");
      bookingObj.groundId = booking.groundId;
    } else {
      // Find in fallback data
      const fallbackGround = fallbackGrounds.find(g => g._id === bookingObj.groundId);
      if (fallbackGround) {
        bookingObj.groundId = fallbackGround;
      }
    }

    res.json({ 
      success: true, 
      booking: bookingObj 
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch booking" 
    });
  }
});

// Update booking status (authenticated)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;
    if (!bookingId || bookingId === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }
    const { status, reason } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if the user is the booking user or the ground owner
    let isOwner = false;
    if (booking.groundId) {
      // If groundId is populated, use it directly; otherwise, fetch ground
      let ground = booking.groundId;
      if (typeof ground === 'string' || typeof ground === 'object' && ground._bsontype === 'ObjectID') {
        ground = await Ground.findById(booking.groundId);
      }
      if (ground && ground.owner && String(ground.owner.userId) === String(userId)) {
        isOwner = true;
      }
    }

    if (String(booking.userId) !== String(userId) && !isOwner) {
      return res.status(403).json({ success: false, message: "You do not have permission to update this booking." });
    }

    booking.status = status;
    if (reason) {
      booking.cancellationReason = reason;
    }

    await booking.save();

    res.json({ 
      success: true, 
      booking: booking.toObject() 
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update booking status" 
    });
  }
});

// Get bookings for a ground and date (for availability check)
router.get("/ground/:groundId/:date", async (req, res) => {
  try {
    const { groundId, date } = req.params;

    // Fetch all bookings for this ground and date
    const bookings = await Booking.find({
      groundId,
      bookingDate: date,
      status: { $in: ["pending", "confirmed"] }
    }).select("timeSlot status");

    // Get all possible slots (24h)
    const ALL_24H_SLOTS = Array.from({ length: 24 }, (_, i) => {
      const start = `${i.toString().padStart(2, "0")}:00`;
      const end = `${((i + 1) % 24).toString().padStart(2, "0")}:00`;
      return `${start}-${end}`;
    });

    // Find booked slots and check for overlaps
    const bookedSlots = [];
    const availableSlots = [];

    for (const slot of ALL_24H_SLOTS) {
      const [slotStart, slotEnd] = slot.split("-");
      const slotStartTime = new Date(`2000-01-01 ${slotStart}`);
      const slotEndTime = new Date(`2000-01-01 ${slotEnd}`);
      
      let isSlotBooked = false;
      
      for (const booking of bookings) {
        const bookingStart = new Date(`2000-01-01 ${booking.timeSlot.startTime}`);
        const bookingEnd = new Date(`2000-01-01 ${booking.timeSlot.endTime}`);
        
        // Check if this slot overlaps with the booking
        if (slotStartTime < bookingEnd && slotEndTime > bookingStart) {
          isSlotBooked = true;
          break;
        }
      }
      
      if (isSlotBooked) {
        bookedSlots.push(slot);
      } else {
        availableSlots.push(slot);
      }
    }

    res.json({
      success: true,
      availability: {
        availableSlots,
        bookedSlots
      }
    });

  } catch (error) {
    console.error("Error fetching ground bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ground bookings"
    });
  }
});

// Approve a booking (set status to 'confirmed') by ground owner
router.patch("/:id/approve", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "ground_owner") {
      return res.status(403).json({ success: false, message: "Access denied. Not a ground owner." });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    // Check if the booking's ground belongs to this owner
    const ground = await Ground.findById(booking.groundId);
    if (!ground || String(ground.owner.userId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "You do not own this ground." });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be approved." });
    }
    booking.status = "confirmed";
    await booking.save();
    res.json({ success: true, message: "Booking approved.", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to approve booking", error: error.message });
  }
});

// Demo routes for backward compatibility
export const demoBookings = [];

// Create a booking (demo - for backward compatibility)
router.post("/demo", (req, res) => {
  const { groundId, bookingDate, timeSlot, playerDetails, requirements } = req.body;
  const ground = fallbackGrounds.find((g) => g._id === groundId);
  if (!ground) {
    return res.status(400).json({ success: false, message: "Ground not found" });
  }
  // Parse time slot (format: "10:00-12:00")
  const [startTime, endTime] = timeSlot.split("-");
  
  // Validate time slot
  const timeSlotValidation = validateTimeSlot(timeSlot);
  if (!timeSlotValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: timeSlotValidation.error
    });
  }
  
  // Check if slot is already booked (overlap check)
  const alreadyBooked = demoBookings.some(
    (b) => b.groundId === groundId && b.bookingDate === bookingDate && 
    doTimeRangesOverlap(startTime, endTime, b.timeSlot.split("-")[0], b.timeSlot.split("-")[1])
  );
  if (alreadyBooked) {
    return res.status(400).json({ success: false, message: "Slot overlaps with an existing booking" });
  }
  const pricing = getPricing(ground, { startTime: timeSlot.split('-')[0], endTime: timeSlot.split('-')[1], duration: calculateDuration(timeSlot.split('-')[0], timeSlot.split('-')[1]) });
  const nowId = `${Date.now()}`;
  const booking = {
    _id: nowId,
    id: nowId, // For frontend compatibility
    groundId,
    bookingDate,
    timeSlot,
    playerDetails,
    requirements,
    createdAt: new Date().toISOString(),
    amount: pricing.totalAmount, // legacy field
    currency: "INR",
    pricing,
    status: "pending",
  };
  demoBookings.push(booking);

  const safeGround = {
    _id: ground._id || booking.groundId,
    name: ground.name || "Unknown Ground",
    description: ground.description || "",
    location: ground.location || {},
    price: ground.price || {},
    images: ground.images || [],
    amenities: ground.amenities || [],
    features: ground.features || {},
    availability: ground.availability || {},
    status: ground.status || "active",
    isVerified: ground.isVerified !== undefined ? ground.isVerified : true,
    totalBookings: ground.totalBookings || 0,
    rating: ground.rating || { average: 0, count: 0, reviews: [] },
    owner: ground.owner || {},
    verificationDocuments: ground.verificationDocuments || {},
    policies: ground.policies || {},
  };

  res.json({ success: true, booking: { ...booking, id: booking._id, ground: safeGround } });
});

// Get booking details by ID (demo - for backward compatibility)
router.get("/demo/:id", (req, res) => {
  const booking = demoBookings.find((b) => b._id === req.params.id);
    if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  const ground = fallbackGrounds.find((g) => g._id === booking.groundId) || {};
  let pricing = booking.pricing;
  if (!pricing) {
    pricing = getPricing(ground, { startTime: booking.timeSlot.startTime, endTime: booking.timeSlot.endTime, duration: booking.timeSlot.duration });
    booking.pricing = pricing;
  }

  const safeGround = {
    _id: ground._id || booking.groundId,
    name: ground.name || "Unknown Ground",
    description: ground.description || "",
    location: ground.location || {},
    price: ground.price || {},
    images: ground.images || [],
    amenities: ground.amenities || [],
    features: ground.features || {},
    availability: ground.availability || {},
    status: ground.status || "active",
    isVerified: ground.isVerified !== undefined ? ground.isVerified : true,
    totalBookings: ground.totalBookings || 0,
    rating: ground.rating || { average: 0, count: 0, reviews: [] },
    owner: ground.owner || {},
    verificationDocuments: ground.verificationDocuments || {},
    policies: ground.policies || {},
  };
  res.json({ success: true, booking: { ...booking, id: booking._id, ground: safeGround, pricing } });
});

// --- ADMIN ROUTER ---
const adminRouter = express.Router();

// GET /api/admin/bookings - get all bookings
adminRouter.get("/", async (req, res) => {
  try {
    console.log('Admin fetching all bookings...');
    console.log('Authorization header:', req.headers.authorization);
    
    // For now, let's allow all requests to see all bookings
    // In production, you'd want to add proper admin authentication here
    const bookings = await Booking.find({})
      .populate("userId", "name email")
      .populate("groundId", "name location")
      .sort({ createdAt: -1 }); // Sort by most recent first
    console.log(`Found ${bookings.length} bookings`);
    
    // Log some booking details for debugging
    console.log('Recent bookings:');
    bookings.slice(0, 5).forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking._id,
        bookingId: booking.bookingId,
        userId: booking.userId?.name || booking.userId,
        groundId: booking.groundId?.name || booking.groundId,
        status: booking.status,
        date: booking.bookingDate,
        createdAt: booking.createdAt
      });
    });
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
});

// GET /api/bookings/ground/:groundId/:date - get ground availability
adminRouter.get("/ground/:groundId/:date", async (req, res) => {
  try {
    const { groundId, date } = req.params;
    console.log(`Admin availability request for ground: ${groundId}, date: ${date}`);
    
    // Get all bookings for this ground on this date
    const bookings = await Booking.find({
      groundId,
      bookingDate: new Date(date),
      status: { $in: ["pending", "confirmed"] }
    });
    console.log(`Found ${bookings.length} existing bookings`);

    // Generate all possible time slots (24 hours) - INDIVIDUAL TIMES, NOT RANGES
    const allSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    console.log(`Generated all slots: ${allSlots.slice(0, 5)}... (${allSlots.length} total)`);
    
    // Filter out booked slots
    const bookedSlots = new Set();
    bookings.forEach(booking => {
      const startHour = parseInt(booking.timeSlot.startTime.split(':')[0]);
      const endHour = parseInt(booking.timeSlot.endTime.split(':')[0]);
      for (let hour = startHour; hour < endHour; hour++) {
        bookedSlots.add(`${hour.toString().padStart(2, '0')}:00`);
      }
    });
    console.log(`Booked slots: ${Array.from(bookedSlots)}`);

    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));
    console.log(`Available slots: ${availableSlots.slice(0, 10)}... (${availableSlots.length} total)`);

    res.json({
      success: true,
      availability: {
        date,
        groundId,
        availableSlots,
        bookedSlots: Array.from(bookedSlots)
      }
    });

  } catch (error) {
    console.error("Error getting availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get availability"
    });
  }
});

// POST /api/admin/bookings - create a new booking (admin)
adminRouter.post("/", async (req, res) => {
  try {
    console.log('Admin booking creation request:', req.body);
    const { groundId, bookingDate, timeSlot, playerDetails, requirements } = req.body;
    
    // Validation
    if (!groundId || !bookingDate || !timeSlot || !playerDetails) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Validate player details
    if (!playerDetails.contactPerson || !playerDetails.contactPerson.name || !playerDetails.contactPerson.phone) {
      return res.status(400).json({
        success: false,
        message: "Contact person name and phone are required"
      });
    }

    if (!playerDetails.playerCount || playerDetails.playerCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of players must be at least 1"
      });
    }

    // Check if ground exists
    console.log('Looking for ground with ID:', groundId);
    const ground = await Ground.findById(groundId);
    if (!ground) {
      console.log('Ground not found for ID:', groundId);
      return res.status(400).json({ 
        success: false, 
        message: "Ground not found" 
      });
    }
    console.log('Found ground:', ground.name);

    // Check ground capacity
    if (ground.features && ground.features.capacity && playerDetails.playerCount > ground.features.capacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${ground.features.capacity} players allowed for this ground`
      });
    }

    // Parse time slot
    const [startTime, endTime] = timeSlot.split("-");
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot format. Use HH:MM-HH:MM"
      });
    }
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Validate duration
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot duration"
      });
    }
    
    console.log('Time slot parsing:', { startTime, endTime, duration });

    // Check for overlapping bookings
    const existingBookings = await Booking.find({
      groundId,
      bookingDate: new Date(bookingDate),
      status: { $in: ["pending", "confirmed"] }
    });

    const overlappingBooking = existingBookings.find(booking => {
      const bookingStart = new Date(`2000-01-01 ${booking.timeSlot.startTime}`);
      const bookingEnd = new Date(`2000-01-01 ${booking.timeSlot.endTime}`);
      return start < bookingEnd && end > bookingStart;
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        success: false, 
        message: `This time slot (${startTime}-${endTime}) overlaps with an existing booking (${overlappingBooking.timeSlot.startTime}-${overlappingBooking.timeSlot.endTime}). Please select a different time.` 
      });
    }

    // Calculate pricing
    console.log('Ground pricing:', ground.price);
    const perHourPrice = ground.price?.perHour || 1000; // Default price if not set
    console.log('Per hour price:', perHourPrice);
    console.log('Duration:', duration);
    const baseAmount = perHourPrice * duration;
    const discount = ground.price?.discount || 0;
    const discountedAmount = baseAmount - discount;
    const convenienceFee = Math.round(discountedAmount * 0.02); // 2% convenience fee
    const totalAmount = discountedAmount + convenienceFee;
    
    // Validate pricing calculations
    if (isNaN(baseAmount) || isNaN(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pricing calculation. Please check ground pricing."
      });
    }
    
    console.log('Pricing calculation:', {
      perHourPrice,
      duration,
      baseAmount,
      discount,
      discountedAmount,
      taxes: convenienceFee,
      totalAmount
    });

    // Generate unique booking ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const bookingId = `BC${timestamp}${random}`.toUpperCase();

    // Create booking (admin creates bookings)
    // For admin bookings, we'll create or find a system user
    let systemUser;
    try {
      systemUser = await User.findOne({ email: "system@boxcricket.com" });
      if (!systemUser) {
        // Create system user if it doesn't exist
        // Use a unique phone number to avoid conflicts
        const uniquePhone = `system${Date.now()}`;
        systemUser = new User({
          name: "System User",
          email: "system@boxcricket.com",
          phone: uniquePhone,
          password: "system123", // This won't be used for login
          role: "user",
          isVerified: true
        });
        await systemUser.save();
        console.log('Created system user:', systemUser._id);
      } else {
        console.log('Found existing system user:', systemUser._id);
      }
    } catch (userError) {
      console.error('Error with system user:', userError);
      return res.status(500).json({
        success: false,
        message: "Error creating system user for admin booking: " + userError.message
      });
    }
    
    console.log('Creating booking with data:', {
      bookingId,
      userId: systemUser._id,
      groundId,
      bookingDate: new Date(bookingDate),
      timeSlot: { startTime, endTime, duration },
      playerDetails: {
        teamName: playerDetails.teamName,
        playerCount: playerDetails.playerCount,
        contactPerson: playerDetails.contactPerson,
        requirements
      },
      pricing: {
        baseAmount,
        discount,
        taxes: convenienceFee,
        totalAmount,
        currency: "INR"
      }
    });

    const booking = new Booking({
      bookingId,
      userId: systemUser._id, // Use system user for admin bookings
      groundId,
      bookingDate: new Date(bookingDate),
      timeSlot: {
        startTime,
        endTime,
        duration
      },
      playerDetails: {
        teamName: playerDetails.teamName,
        playerCount: playerDetails.playerCount,
        contactPerson: playerDetails.contactPerson,
        requirements
      },
      pricing: {
        baseAmount,
        discount,
        taxes: convenienceFee,
        totalAmount,
        currency: "INR"
      },
      status: "confirmed" // Admin-created bookings are automatically confirmed
    });

    try {
      await booking.save();
      console.log('Booking saved successfully:', booking._id);
      console.log('Booking details:', {
        bookingId: booking.bookingId,
        date: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
        createdAt: booking.createdAt
      });
    } catch (saveError) {
      console.error('Error saving booking:', saveError);
      return res.status(500).json({
        success: false,
        message: "Error saving booking: " + saveError.message
      });
    }
    
    // Populate ground details
    await booking.populate("groundId", "name location price features");

    res.json({ 
      success: true, 
      booking: booking.toObject() 
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create booking" 
    });
  }
});

// PATCH /api/admin/bookings/:id - update a booking
adminRouter.patch("/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const update = req.body;
    const allowedFields = [
      "status",
      "bookingDate",
      "timeSlot",
      "playerDetails",
      "requirements",
      "pricing"
    ];
    // Only allow updating certain fields
    const updateData = {};
    for (const key of allowedFields) {
      if (update[key] !== undefined) {
        updateData[key] = update[key];
      }
    }
    const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true })
      .populate("userId", "name email")
      .populate("groundId", "name location");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
});

export { adminRouter };

export default router;