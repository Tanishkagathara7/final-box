const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function debugBookingError() {
  console.log('🔍 Debugging booking error...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running');

    // 2. Test user registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      email: 'debug@test.com',
      password: 'password123',
      name: 'Debug User',
      phone: '9876543211'
    };

    let registerResponse;
    try {
      registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ User registered');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, proceeding with login');
      } else {
        throw error;
      }
    }

    // 3. Test user login
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginResponse.data.token;
    console.log('✅ User logged in');

    // 4. Test booking creation with detailed error logging
    console.log('\n4. Testing booking creation...');
    const testBooking = {
      groundId: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
      bookingDate: '2024-12-25',
      timeSlot: '10:00-12:00',
      playerDetails: {
        teamName: 'Debug Team',
        playerCount: 10,
        contactPerson: {
          name: 'Debug Contact',
          phone: '9876543211',
          email: 'debug@test.com'
        }
      },
      requirements: 'Debug test booking'
    };

    console.log('📤 Sending booking data:', JSON.stringify(testBooking, null, 2));

    try {
      const bookingResponse = await axios.post(`${API_BASE}/bookings`, testBooking, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Booking created successfully!');
      console.log('📋 Response:', JSON.stringify(bookingResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Booking creation failed!');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error Message:', error.message);
      
      if (error.response?.data?.error) {
        console.error('Server Error Details:', error.response.data.error);
      }
    }

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the debug
debugBookingError(); 