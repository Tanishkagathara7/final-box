const axios = require('axios');

async function testRealCashfree() {
  console.log('🧪 Testing REAL Cashfree payment gateway...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running');

    // 2. Test Cashfree connection
    console.log('\n2. Testing Cashfree connection...');
    try {
      const cashfreeResponse = await axios.get('http://localhost:3001/api/payments/test-cashfree');
      console.log('✅ Cashfree connection successful');
      console.log('📋 Connection details:', {
        appId: cashfreeResponse.data.appId ? 'Present' : 'Missing',
        apiUrl: cashfreeResponse.data.apiUrl,
        mode: cashfreeResponse.data.mode
      });
    } catch (error) {
      console.error('❌ Cashfree connection failed:', error.response?.data?.message);
      console.log('💡 Make sure you have set:');
      console.log('   - CASHFREE_APP_ID');
      console.log('   - CASHFREE_SECRET_KEY');
      console.log('   - CASHFREE_MODE (optional, defaults to production)');
      return;
    }

    // 3. Test user authentication
    console.log('\n3. Testing user authentication...');
    const testUser = {
      email: 'realcashfree@example.com',
      password: 'password123',
      name: 'Real Cashfree User',
      phone: '9876543216'
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

    // 4. Create a test booking
    console.log('\n4. Creating test booking...');
    const testBooking = {
      groundId: '507f1f77bcf86cd799439011',
      bookingDate: '2024-12-25',
      timeSlot: '10:00-12:00',
      playerDetails: {
        teamName: 'Real Cashfree Team',
        playerCount: 10,
        contactPerson: {
          name: 'Real Cashfree Contact',
          phone: '9876543216',
          email: 'realcashfree@example.com'
        }
      },
      requirements: 'Real Cashfree test booking'
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

    // 5. Test REAL payment order creation
    console.log('\n5. Testing REAL Cashfree payment order creation...');
    try {
      const paymentResponse = await axios.post('http://localhost:3001/api/payments/create-order', {
        bookingId: bookingId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ REAL Cashfree payment order created successfully!');
      console.log('📋 Order details:', {
        orderId: paymentResponse.data.order.id,
        amount: paymentResponse.data.order.amount,
        currency: paymentResponse.data.order.currency,
        paymentUrl: paymentResponse.data.order.payment_url,
        orderStatus: paymentResponse.data.order.order_status
      });
      
      console.log('💳 This is a REAL Cashfree payment order - no mock payments!');
      console.log('🔗 Payment URL:', paymentResponse.data.order.payment_url);
      
    } catch (error) {
      console.error('❌ Payment order creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message);
      
      if (error.response?.status === 500 && error.response?.data?.message?.includes('not configured')) {
        console.log('\n💡 SOLUTION: Set your Cashfree environment variables:');
        console.log('   CASHFREE_APP_ID=your_app_id_here');
        console.log('   CASHFREE_SECRET_KEY=your_secret_key_here');
        console.log('   CASHFREE_MODE=test (for sandbox) or production');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealCashfree(); 