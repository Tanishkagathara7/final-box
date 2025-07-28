// Test script to verify time formatting
function formatTime12h(time24h) {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
}

function formatTimeRange(startTime, endTime) {
  return `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
}

// Test cases
const testTimes = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

console.log('Testing formatTime12h function:');
testTimes.forEach(time => {
  console.log(`${time} -> ${formatTime12h(time)}`);
});

console.log('\nTesting formatTimeRange function:');
console.log('13:00-14:00 ->', formatTimeRange('13:00', '14:00'));
console.log('09:00-10:00 ->', formatTimeRange('09:00', '10:00'));
console.log('23:00-00:00 ->', formatTimeRange('23:00', '00:00'));

// Test what happens if we pass a range string to formatTime12h
console.log('\nTesting what happens if we pass a range to formatTime12h:');
console.log('"13:00-14:00" ->', formatTime12h('13:00-14:00')); // This will cause an error 