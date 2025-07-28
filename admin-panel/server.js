// --- ES Module Imports ---
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';

// --- Fix for __dirname in ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- CONFIG ---
const MONGO_URI = 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority'; // Atlas URI, using boxcricket DB
const JWT_SECRET = 'adminpanel_secret';

// --- MODELS ---
// Define schemas inline since we can't import from main server
const locationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  popular: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'ground_owner'], default: 'user' },
  isVerified: { type: Boolean, default: false }
});

const groundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: {
    address: String,
    cityId: String,
    cityName: String,
    state: String,
    latitude: Number,
    longitude: Number,
    pincode: String
  },
  price: {
    perHour: Number,
    currency: { type: String, default: 'INR' },
    discount: { type: Number, default: 0 },
    ranges: [{
      start: String,
      end: String,
      perHour: Number
    }]
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  amenities: [String],
  features: {
    pitchType: String,
    capacity: Number,
    lighting: Boolean,
    parking: Boolean,
    changeRoom: Boolean,
    washroom: Boolean,
    cafeteria: Boolean,
    equipment: Boolean
  },
  owner: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    contact: String,
    email: String,
    verified: { type: Boolean, default: false }
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    reviews: []
  },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ground', required: true },
  bookingDate: { type: Date, required: true },
  timeSlot: {
    startTime: String,
    endTime: String,
    duration: Number
  },
  playerDetails: {
    teamName: String,
    playerCount: Number,
    contactPerson: {
      name: String,
      phone: String,
      email: String
    },
    requirements: String
  },
  pricing: {
    baseAmount: Number,
    discount: Number,
    convenienceFee: Number,
    totalAmount: Number,
    currency: { type: String, default: 'INR' }
  },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  payment: {
    method: String,
    status: String,
    transactionId: String
  }
}, { timestamps: true });

// Create models
const Location = mongoose.model('Location', locationSchema);
const User = mongoose.model('User', userSchema);
const Ground = mongoose.model('Ground', groundSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// --- EXPRESS APP ---
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Admin Auth Middleware ---
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Not admin');
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// --- Admin Login (hardcoded) ---
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@boxcric.com' && password === 'admin123') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

// --- Grounds CRUD ---
app.get('/api/admin/grounds', adminAuth, async (req, res) => {
  try {
    // Forward the request to the main server with authorization header
    const response = await fetch('http://localhost:3001/api/admin/grounds', {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching grounds:', error);
    res.status(500).json({ message: 'Failed to fetch grounds' });
  }
});

app.post('/api/admin/grounds', adminAuth, async (req, res) => {
  try {
    // Forward the request to the main server
    const response = await fetch('http://localhost:3001/api/admin/grounds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error creating ground:', error);
    res.status(500).json({ message: 'Failed to create ground' });
  }
});

app.put('/api/admin/grounds/:id', adminAuth, async (req, res) => {
  try {
    // Forward the request to the main server
    const response = await fetch(`http://localhost:3001/api/admin/grounds/${req.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error updating ground:', error);
    res.status(500).json({ message: 'Failed to update ground' });
  }
});

app.delete('/api/admin/grounds/:id', adminAuth, async (req, res) => {
  try {
    // Forward the request to the main server
    const response = await fetch(`http://localhost:3001/api/admin/grounds/${req.params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error deleting ground:', error);
    res.status(500).json({ message: 'Failed to delete ground' });
  }
});

// --- Location CRUD Endpoints ---
app.get('/api/admin/locations', adminAuth, async (req, res) => {
  try {
    // Use local database instead of forwarding to main server
    const locations = await Location.find({});
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Failed to fetch locations' });
  }
});

app.post('/api/admin/locations', adminAuth, async (req, res) => {
  try {
    // Use local database instead of forwarding to main server
    const location = await Location.create(req.body);
    res.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/admin/locations/:id', adminAuth, async (req, res) => {
  try {
    // Use local database instead of forwarding to main server
    const location = await Location.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/admin/locations/:id', adminAuth, async (req, res) => {
  try {
    // Use local database instead of forwarding to main server
    await Location.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(400).json({ message: error.message });
  }
});

// --- Admin: Get All Bookings (with user and ground names) ---
app.get('/api/admin/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .populate('groundId', 'name');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: err.message });
  }
});

// --- Admin: Get Ground Availability ---
app.get('/api/admin/bookings/ground/:groundId/:date', async (req, res) => {
  try {
    const { groundId, date } = req.params;
    
    // Get all bookings for this ground on this date
    const bookings = await Booking.find({
      groundId,
      bookingDate: new Date(date),
      status: { $in: ["pending", "confirmed"] }
    });

    // Generate all possible time slots (24 hours)
    const allSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    // Filter out booked slots
    const bookedSlots = new Set();
    bookings.forEach(booking => {
      const startHour = parseInt(booking.timeSlot.startTime.split(':')[0]);
      const endHour = parseInt(booking.timeSlot.endTime.split(':')[0]);
      for (let hour = startHour; hour < endHour; hour++) {
        bookedSlots.add(`${hour.toString().padStart(2, '0')}:00`);
      }
    });

    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));

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

// --- Admin: Create New Booking ---
app.post('/api/admin/bookings', adminAuth, async (req, res) => {
  try {
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
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return res.status(400).json({ 
        success: false, 
        message: "Ground not found" 
      });
    }

    // Check ground capacity
    if (ground.features && ground.features.capacity && playerDetails.playerCount > ground.features.capacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${ground.features.capacity} players allowed for this ground`
      });
    }

    // Parse time slot
    const [startTime, endTime] = timeSlot.split("-");
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

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
    const baseAmount = ground.price.perHour * duration;
    const discount = ground.price?.discount || 0;
    const discountedAmount = baseAmount - discount;
    const convenienceFee = Math.round(discountedAmount * 0.02); // 2% convenience fee
    const totalAmount = discountedAmount + convenienceFee;

    // Generate unique booking ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const bookingId = `BC${timestamp}${random}`.toUpperCase();

    // Create booking (admin creates bookings without a specific user)
    const booking = new Booking({
      bookingId,
      userId: null, // Admin-created bookings don't have a specific user
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
        convenienceFee,
        totalAmount,
        currency: "INR"
      },
      status: "confirmed" // Admin-created bookings are automatically confirmed
    });

    await booking.save();
    
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

// --- Admin: Update Booking Status ---
app.patch('/api/admin/bookings/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('userId', 'name')
      .populate('groundId', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking', error: err.message });
  }
});

// --- Admin: Delete Booking ---
app.delete('/api/admin/bookings/:id', adminAuth, async (req, res) => {
  try {
    const result = await Booking.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete booking', error: err.message });
  }
});

// --- Full Indian Cities List (copy from user panel) ---
const indianCities = [
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777, popular: true },
  { id: "delhi", name: "Delhi", state: "Delhi", latitude: 28.7041, longitude: 77.1025, popular: true },
  { id: "bangalore", name: "Bangalore", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, popular: true },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", latitude: 17.385, longitude: 78.4867, popular: true },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707, popular: true },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, popular: true },
  { id: "pune", name: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567, popular: true },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714, popular: true },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, popular: false },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462, popular: false },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", latitude: 26.4499, longitude: 80.3319, popular: false },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", latitude: 21.1458, longitude: 79.0882, popular: false },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", latitude: 22.7196, longitude: 75.8577, popular: false },
  { id: "thane", name: "Thane", state: "Maharashtra", latitude: 19.2183, longitude: 72.9781, popular: false },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", latitude: 23.2599, longitude: 77.4126, popular: false },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185, popular: false },
  { id: "patna", name: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376, popular: false },
  { id: "vadodara", name: "Vadodara", state: "Gujarat", latitude: 22.3072, longitude: 73.1812, popular: false },
  { id: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", latitude: 28.6692, longitude: 77.4538, popular: false },
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", latitude: 30.9010, longitude: 75.8573, popular: false },
];

// --- Auto-populate locations if empty ---
async function autoPopulateCities() {
  const count = await Location.countDocuments();
  if (count === 0) {
    await Location.insertMany(indianCities);
    console.log('✅ Indian cities auto-populated in locations collection');
  }
}

// --- Start Server ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    await autoPopulateCities();
    app.listen(4000, () => {
      console.log('✅ Admin panel running at http://localhost:4000');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
