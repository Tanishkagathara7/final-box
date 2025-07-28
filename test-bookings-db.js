// Test script to check bookings in the database
import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testBookings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import the Booking model
    const { default: Booking } = await import('./server/models/Booking.js');
    
    // Check total number of bookings
    const totalBookings = await Booking.countDocuments({});
    console.log(`Total bookings in database: ${totalBookings}`);
    
    if (totalBookings === 0) {
      console.log('❌ No bookings found in database');
      return;
    }
    
    // Get all bookings
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('groundId', 'name location')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`\n📋 Found ${bookings.length} bookings:`);
    
    bookings.forEach((booking, index) => {
      console.log(`\n--- Booking ${index + 1} ---`);
      console.log(`ID: ${booking._id}`);
      console.log(`Booking ID: ${booking.bookingId}`);
      console.log(`User: ${booking.userId?.name || booking.userId || 'N/A'}`);
      console.log(`Ground: ${booking.groundId?.name || booking.groundId || 'N/A'}`);
      console.log(`Date: ${booking.bookingDate}`);
      console.log(`Time Slot: ${booking.timeSlot?.startTime}-${booking.timeSlot?.endTime}`);
      console.log(`Status: ${booking.status}`);
      console.log(`Amount: ${booking.pricing?.totalAmount || 'N/A'}`);
      console.log(`Created: ${booking.createdAt}`);
    });
    
    // Check bookings by status
    const statusCounts = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Bookings by status:');
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testBookings(); 