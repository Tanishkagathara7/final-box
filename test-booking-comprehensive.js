const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  phone: '9876543210'
};

const testGround = {
  _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
  name: 'Test Cricket Ground',
  price: {
    perHour: 1000,
    ranges: [
      { start: '06:00', end: '18:00', perHour: 1000 },
      { start: '18:00', end: '06:00', perHour: 1200 }
    ]
  },
  features: {
    capacity: 22
  }
};

const testBooking = {
  groundId: '507f1f77bcf86cd799439011',
  bookingDate: '2024-12-25',
  timeSlot: '10:00-12:00',
  playerDetails: {
    teamName: 'Test Team',
    playerCount: 10,
    contactPerson: {
      name: 'Test Contact',
      phone: '9876543210',
      email: 'contact@test.com'
    }
  },
  requirements: 'Test requirements'
};

async function testBookingFlow() {
  console.log('🧪 Starting comprehensive booking test...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);

    // 2. Test user registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ User registered:', registerResponse.data.success);

    // 3. Test user login
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginResponse.data.token;
    console.log('✅ User logged in:', loginResponse.data.success);

    // 4. Test booking creation
    console.log('\n4. Testing booking creation...');
    const bookingResponse = await axios.post(`${API_BASE}/bookings`, testBooking, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Booking created:', bookingResponse.data.success);
    console.log('📋 Booking details:', {
      bookingId: bookingResponse.data.booking.bookingId,
      status: bookingResponse.data.booking.status,
      pricing: bookingResponse.data.booking.pricing
    });

    // 5. Test booking retrieval
    console.log('\n5. Testing booking retrieval...');
    const bookingId = bookingResponse.data.booking._id;
    const getBookingResponse = await axios.get(`${API_BASE}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Booking retrieved:', getBookingResponse.data.success);

    // 6. Test my bookings endpoint
    console.log('\n6. Testing my bookings endpoint...');
    const myBookingsResponse = await axios.get(`${API_BASE}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ My bookings retrieved:', myBookingsResponse.data.success);
    console.log('📊 Total bookings:', myBookingsResponse.data.bookings.length);

    // 7. Test availability endpoint
    console.log('\n7. Testing availability endpoint...');
    const availabilityResponse = await axios.get(`${API_BASE}/bookings/ground/${testGround._id}/${testBooking.bookingDate}`);
    console.log('✅ Availability retrieved:', availabilityResponse.data.success);
    console.log('📅 Available slots:', availabilityResponse.data.availability.availableSlots.length);

    // 8. Test booking status update
    console.log('\n8. Testing booking status update...');
    const statusUpdateResponse = await axios.patch(`${API_BASE}/bookings/${bookingId}/status`, {
      status: 'confirmed'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Booking status updated:', statusUpdateResponse.data.success);

    console.log('\n🎉 All booking tests passed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Server health: ✅');
    console.log('- User authentication: ✅');
    console.log('- Booking creation: ✅');
    console.log('- Booking retrieval: ✅');
    console.log('- Availability check: ✅');
    console.log('- Status updates: ✅');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      stack: error.stack
    });
  }
}

// Run the test
testBookingFlow(); 