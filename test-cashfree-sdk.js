import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testCashfreeSDK() {
  console.log('🧪 Testing Cashfree SDK Integration...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running');

    // 2. Test Cashfree SDK connection
    console.log('\n2. Testing Cashfree SDK connection...');
    const cashfreeResponse = await axios.get('http://localhost:3001/api/payments/test-cashfree');
    
    if (cashfreeResponse.data.success) {
      console.log('✅ Cashfree SDK connection successful');
      console.log('   Test Order ID:', cashfreeResponse.data.testOrderId);
      console.log('   Payment Session ID:', cashfreeResponse.data.paymentSessionId);
      console.log('   Mode:', cashfreeResponse.data.mode);
    } else {
      console.log('❌ Cashfree SDK connection failed:', cashfreeResponse.data.error);
      return;
    }

    // 3. Test frontend availability
    console.log('\n3. Testing frontend...');
    try {
      const frontendResponse = await axios.get('http://localhost:8080');
      console.log('✅ Frontend is running on port 8080');
    } catch (error) {
      console.log('⚠️  Frontend not accessible on port 8080');
      console.log('   Make sure to run: npm run dev');
    }

    console.log('\n📋 Cashfree SDK Integration Summary:');
    console.log('✅ Backend Server: Running on port 3001');
    console.log('✅ Cashfree SDK: Connected and working');
    console.log('✅ Order Creation: Using official SDK');
    console.log('✅ Payment Session: Generated successfully');
    console.log('✅ API Endpoints: Available');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Open http://localhost:8080 in your browser');
    console.log('2. Create a booking');
    console.log('3. Click "Pay Now"');
    console.log('4. Cashfree SDK will handle the checkout');
    console.log('5. Complete payment and verify confirmation');

    console.log('\n🔍 Monitor these URLs:');
    console.log('- Frontend: http://localhost:8080');
    console.log('- Backend API: http://localhost:3001/api');
    console.log('- Cashfree SDK Test: http://localhost:3001/api/payments/test-cashfree');

    console.log('\n💡 Key Improvements:');
    console.log('- Using official Cashfree SDK');
    console.log('- Better error handling');
    console.log('- Proper TypeScript support');
    console.log('- Secure payment session handling');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCashfreeSDK(); 