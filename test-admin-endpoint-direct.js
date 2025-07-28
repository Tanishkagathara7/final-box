// Direct test script to call admin endpoint
import fetch from 'node-fetch';

async function testAdminEndpointDirect() {
  try {
    console.log('Testing admin endpoint directly...');
    
    // Test with a sample ground ID and date
    const groundId = '507f1f77bcf86cd799439011'; // Sample ground ID
    const date = new Date().toISOString().split('T')[0]; // Today's date
    
    const url = `http://localhost:3001/api/admin/bookings/ground/${groundId}/${date}`;
    console.log('Testing URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.availability) {
      console.log('\n✅ Admin endpoint working!');
      console.log('Available slots:', data.availability.availableSlots);
      console.log('Booked slots:', data.availability.bookedSlots);
      
      // Check if slots are individual times or ranges
      if (data.availability.availableSlots.length > 0) {
        const firstSlot = data.availability.availableSlots[0];
        console.log('First available slot:', firstSlot);
        console.log('Is time range (contains "-"):', firstSlot.includes('-'));
        console.log('Is individual time (HH:MM format):', /^\d{2}:\d{2}$/.test(firstSlot));
        
        if (firstSlot.includes('-')) {
          console.log('❌ ERROR: Server is returning time ranges instead of individual times!');
        } else {
          console.log('✅ Server is returning individual times correctly!');
        }
      }
    } else {
      console.log('❌ Admin endpoint not working as expected');
      console.log('Error:', data.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin endpoint:', error.message);
  }
}

// Also test the regular endpoint for comparison
async function testRegularEndpointDirect() {
  try {
    console.log('\n\nTesting regular endpoint directly...');
    
    const groundId = '507f1f77bcf86cd799439011';
    const date = new Date().toISOString().split('T')[0];
    
    const url = `http://localhost:3001/api/bookings/ground/${groundId}/${date}`;
    console.log('Testing URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.availability) {
      console.log('\n✅ Regular endpoint working!');
      console.log('Available slots:', data.availability.availableSlots);
      
      // Check if slots are individual times or ranges
      if (data.availability.availableSlots.length > 0) {
        const firstSlot = data.availability.availableSlots[0];
        console.log('First available slot:', firstSlot);
        console.log('Is time range (contains "-"):', firstSlot.includes('-'));
        console.log('Is individual time (HH:MM format):', /^\d{2}:\d{2}$/.test(firstSlot));
        
        if (firstSlot.includes('-')) {
          console.log('✅ Regular endpoint correctly returns time ranges');
        } else {
          console.log('❌ Regular endpoint incorrectly returns individual times');
        }
      }
    } else {
      console.log('❌ Regular endpoint not working as expected');
    }
    
  } catch (error) {
    console.error('❌ Error testing regular endpoint:', error.message);
  }
}

// Run both tests
async function runDirectTests() {
  await testAdminEndpointDirect();
  await testRegularEndpointDirect();
}

runDirectTests(); 