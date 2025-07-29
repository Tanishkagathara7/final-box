const axios = require('axios');

async function testServerStatus() {
  console.log('🔍 Testing server status...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running');
    console.log('📋 Health response:', healthResponse.data);

    // Test MongoDB connection by trying to create a simple booking
    console.log('\n2. Testing MongoDB connection...');
    
    // First, try to register a test user
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '9876543210'
    };

    let token;
    try {
      const registerResponse = await axios.post('http://localhost:3001/api/auth/register', testUser);
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, trying to login...');
      } else {
        console.error('❌ User registration failed:', error.response?.data);
        return;
      }
    }

    // Try to login
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      token = loginResponse.data.token;
      console.log('✅ User logged in successfully');
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      return;
    }

    // Try to create a booking
    console.log('\n3. Testing booking creation...');
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
          email: 'test@example.com'
        }
      },
      requirements: 'Test booking'
    };

    try {
      const bookingResponse = await axios.post('http://localhost:3001/api/bookings', testBooking, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Booking created successfully!');
      console.log('📋 Booking ID:', bookingResponse.data.booking.bookingId);
    } catch (error) {
      console.error('❌ Booking creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message);
      console.error('Error:', error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the server is running on port 3001');
    }
  }
}

testServerStatus(); 