/**
 * Test script for 12-hour format conversion
 */

// Test the formatTime12h function
function formatTime12h(time24h) {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
}

// Test cases
const testCases = [
  '00:00', // 12:00 AM
  '06:00', // 6:00 AM
  '12:00', // 12:00 PM
  '13:00', // 1:00 PM
  '18:00', // 6:00 PM
  '23:00', // 11:00 PM
  '09:30', // 9:30 AM
  '14:45', // 2:45 PM
  '21:15', // 9:15 PM
];

console.log('Testing 12-hour format conversion:');
console.log('==================================');

testCases.forEach(time24h => {
  const time12h = formatTime12h(time24h);
  console.log(`${time24h} → ${time12h}`);
});

console.log('\n✅ All time conversions completed!'); 