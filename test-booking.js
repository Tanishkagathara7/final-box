/**
 * Simple test script to verify booking API
 */

const testBooking = async () => {
  const bookingData = {
    groundId: '687dc7a06f512b1b905f812d', // Use a valid ground ID
    bookingDate: '2025-01-27', // Future date
    timeSlot: '13:00-14:00',
    playerDetails: {
      teamName: 'Test Team',
      playerCount: 5,
      contactPerson: {
        name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com'
      }
    },
    requirements: 'Test booking'
  };

  try {
    const response = await fetch('http://localhost:3001/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();
    console.log('Booking response:', result);
    
    if (result.success) {
      console.log('✅ Booking created successfully!');
    } else {
      console.log('❌ Booking failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Test time slot validation
const testTimeSlotValidation = () => {
  const testCases = [
    '13:00-14:00',
    '09:00-10:00',
    '23:00-00:00',
    'invalid-format',
    '13:00-13:00', // Same start and end
    '14:00-13:00'  // End before start
  ];

  testCases.forEach(timeSlot => {
    console.log(`Testing: ${timeSlot}`);
    // This would test the validation function
  });
};

console.log('Booking API Test');
console.log('================');
testTimeSlotValidation(); 