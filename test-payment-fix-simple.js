const axios = require('axios');

async function testPaymentFix() {
  console.log('🧪 Testing payment creation fix...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running');

    // 2. Test user authentication
    console.log('\n2. Testing user authentication...');
    const testUser = {
      email: 'paymentfix@example.com',
      password: 'password123',
      name: 'Payment Fix User',
      phone: '9876543215'
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

    // 3. Create a test booking
    console.log('\n3. Creating test booking...');
    const testBooking = {
      groundId: '507f1f77bcf86cd799439011',
      bookingDate: '2024-12-25',
      timeSlot: '10:00-12:00',
      playerDetails: {
        teamName: 'Payment Fix Team',
        playerCount: 10,
        contactPerson: {
          name: 'Payment Fix Contact',
          phone: '9876543215',
          email: 'paymentfix@example.com'
        }
      },
      requirements: 'Payment fix test booking'
    };

    let bookingId;
    try {
      const bookingResponse = await axios.post('http://localhost:3001/api/bookings', testBooking, {
        headers: { Authorization: `Bearer ${token}` }
      });
      bookingId = bookingResponse.data.booking._id;
      console.log('✅ Booking created:', bookingResponse.data.booking.bookingId);
    } catch (error) {
      console.error('❌ Booking creation failed:', error.response?.data);
      return;
    }

    // 4. Test payment order creation
    console.log('\n4. Testing payment order creation...');
    try {
      const paymentResponse = await axios.post('http://localhost:3001/api/payments/create-order', {
        bookingId: bookingId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Payment order created successfully!');
      console.log('📋 Order details:', {
        orderId: paymentResponse.data.order.id,
        amount: paymentResponse.data.order.amount,
        currency: paymentResponse.data.order.currency,
        paymentUrl: paymentResponse.data.order.payment_url
      });
      
      console.log('💳 Real Cashfree payment order created!');
      
    } catch (error) {
      console.error('❌ Payment order creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message);
      console.error('Error:', error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPaymentFix(); 