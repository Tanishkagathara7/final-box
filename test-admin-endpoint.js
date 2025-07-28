// Test script to verify admin availability endpoint
import fetch from 'node-fetch';

async function testAdminEndpoint() {
  try {
    console.log('Testing admin availability endpoint...');
    
    // Test with a sample ground ID and date
    const groundId = '507f1f77bcf86cd799439011'; // Sample ground ID
    const date = new Date().toISOString().split('T')[0]; // Today's date
    
    const url = `http://localhost:3001/api/admin/bookings/ground/${groundId}/${date}`;
    console.log('Testing URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.availability) {
      console.log('\n✅ Admin endpoint working correctly!');
      console.log('Available slots:', data.availability.availableSlots);
      console.log('Booked slots:', data.availability.bookedSlots);
      
      // Check if slots are individual times or ranges
      if (data.availability.availableSlots.length > 0) {
        const firstSlot = data.availability.availableSlots[0];
        console.log('First available slot:', firstSlot);
        console.log('Is time range (contains "-"):', firstSlot.includes('-'));
        console.log('Is individual time (HH:MM format):', /^\d{2}:\d{2}$/.test(firstSlot));
      }
    } else {
      console.log('❌ Admin endpoint not working as expected');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin endpoint:', error.message);
  }
}

// Also test the regular endpoint for comparison
async function testRegularEndpoint() {
  try {
    console.log('\nTesting regular availability endpoint...');
    
    const groundId = '507f1f77bcf86cd799439011';
    const date = new Date().toISOString().split('T')[0];
    
    const url = `http://localhost:3001/api/bookings/ground/${groundId}/${date}`;
    console.log('Testing URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.availability) {
      console.log('\n✅ Regular endpoint working correctly!');
      console.log('Available slots:', data.availability.availableSlots);
      
      // Check if slots are individual times or ranges
      if (data.availability.availableSlots.length > 0) {
        const firstSlot = data.availability.availableSlots[0];
        console.log('First available slot:', firstSlot);
        console.log('Is time range (contains "-"):', firstSlot.includes('-'));
        console.log('Is individual time (HH:MM format):', /^\d{2}:\d{2}$/.test(firstSlot));
      }
    } else {
      console.log('❌ Regular endpoint not working as expected');
    }
    
  } catch (error) {
    console.error('❌ Error testing regular endpoint:', error.message);
  }
}

// Run both tests
async function runTests() {
  await testAdminEndpoint();
  await testRegularEndpoint();
}

runTests(); 