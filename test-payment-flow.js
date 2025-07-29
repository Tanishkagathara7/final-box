import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testPaymentFlow() {
  console.log('🧪 Testing Complete Payment Flow...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running');

    // 2. Test Cashfree connection
    console.log('\n2. Testing Cashfree connection...');
    const cashfreeResponse = await axios.get('http://localhost:3001/api/payments/test-cashfree');
    if (cashfreeResponse.data.success) {
      console.log('✅ Cashfree connection successful');
      console.log('   Test Order ID:', cashfreeResponse.data.testOrderId);
    } else {
      console.log('❌ Cashfree connection failed');
      return;
    }

    // 3. Test frontend availability
    console.log('\n3. Testing frontend...');
    let frontendRunning = false;
    try {
      const frontendResponse = await axios.get('http://localhost:8080');
      console.log('✅ Frontend is running on port 8080');
      frontendRunning = true;
    } catch (error) {
      console.log('⚠️  Frontend not accessible on port 8080');
      console.log('   Make sure to run: npm run dev');
    }

    console.log('\n📋 Payment Flow Test Summary:');
    console.log('✅ Backend Server: Running on port 3001');
    console.log('✅ Cashfree Gateway: Connected and working');
    console.log('✅ API Endpoints: Available');
    
    if (frontendRunning) {
      console.log('✅ Frontend: Running on port 8080');
    } else {
      console.log('⚠️  Frontend: Please start with npm run dev');
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Open http://localhost:8080 in your browser');
    console.log('2. Create a booking');
    console.log('3. Click "Pay Now"');
    console.log('4. Complete the payment on Cashfree');
    console.log('5. Verify booking confirmation');

    console.log('\n🔍 Monitor these URLs:');
    console.log('- Frontend: http://localhost:8080');
    console.log('- Backend API: http://localhost:3001/api');
    console.log('- Cashfree Test: http://localhost:3001/api/payments/test-cashfree');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPaymentFlow(); 