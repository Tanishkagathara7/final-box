const axios = require('axios');

async function testBookingFix() {
  console.log('🧪 Testing booking creation fix...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running');

    // 2. Test user registration/login
    console.log('\n2. Testing user authentication...');
    const testUser = {
      email: 'testfix@example.com',
      password: 'password123',
      name: 'Test Fix User',
      phone: '9876543212'
    };

    let token;
    try {
      await axios.post('http://localhost:3001/api/auth/register', testUser);
      console.log('✅ User registered');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists');
      } else {
        console.error('❌ Registration failed:', error.response?.data);
        return;
      }
    }

    // Login
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      token = loginResponse.data.token;
      console.log('✅ User logged in');
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      return;
    }

    // 3. Test booking creation
    console.log('\n3. Testing booking creation...');
    const testBooking = {
      groundId: '507f1f77bcf86cd799439011',
      bookingDate: '2024-12-25',
      timeSlot: '10:00-12:00',
      playerDetails: {
        teamName: 'Test Fix Team',
        playerCount: 10,
        contactPerson: {
          name: 'Test Fix Contact',
          phone: '9876543212',
          email: 'testfix@example.com'
        }
      },
      requirements: 'Test fix booking'
    };

    try {
      const bookingResponse = await axios.post('http://localhost:3001/api/bookings', testBooking, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Booking created successfully!');
      console.log('📋 Booking ID:', bookingResponse.data.booking.bookingId);
      console.log('💰 Pricing:', bookingResponse.data.booking.pricing);
    } catch (error) {
      console.error('❌ Booking creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message);
      console.error('Error:', error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookingFix(); 