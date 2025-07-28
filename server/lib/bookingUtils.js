/**
 * Utility functions for booking management
 */

/**
 * Check if two time ranges overlap
 * @param {string} startTime1 - Start time of first range (HH:MM format)
 * @param {string} endTime1 - End time of first range (HH:MM format)
 * @param {string} startTime2 - Start time of second range (HH:MM format)
 * @param {string} endTime2 - End time of second range (HH:MM format)
 * @returns {boolean} - True if ranges overlap
 */
export function doTimeRangesOverlap(startTime1, endTime1, startTime2, endTime2) {
  const start1 = new Date(`2000-01-01 ${startTime1}`);
  const end1 = new Date(`2000-01-01 ${endTime1}`);
  const start2 = new Date(`2000-01-01 ${startTime2}`);
  const end2 = new Date(`2000-01-01 ${endTime2}`);
  
  return start1 < end2 && end1 > start2;
}

/**
 * Validate if a time slot is valid
 * @param {string} timeSlot - Time slot in "HH:MM-HH:MM" format
 * @returns {Object} - Validation result with isValid and error message
 */
export function validateTimeSlot(timeSlot) {
  if (!timeSlot || typeof timeSlot !== 'string') {
    return { isValid: false, error: 'Time slot is required' };
  }
  
  console.log('Validating time slot:', timeSlot);
  
  const parts = timeSlot.split('-');
  
  if (parts.length !== 2) {
    return { isValid: false, error: `Invalid time slot format. Use HH:MM-HH:MM. Received: ${timeSlot}` };
  }
  
  const [startTime, endTime] = parts;
  
  console.log('Parsed times:', { startTime, endTime });
  
  // More robust regex that accepts both single and double digit hours
  // Also handles edge cases better
  const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
  
  if (!timeRegex.test(startTime)) {
    return { isValid: false, error: `Invalid start time format. Use HH:MM. Received: ${startTime}` };
  }
  
  if (!timeRegex.test(endTime)) {
    return { isValid: false, error: `Invalid end time format. Use HH:MM. Received: ${endTime}` };
  }
  
  // Parse times to validate they are valid
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  // Check if the dates are valid (not NaN)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: `Invalid time values. Start: ${startTime}, End: ${endTime}` };
  }
  
  if (start >= end) {
    return { isValid: false, error: 'End time must be after start time' };
  }
  
  console.log('Time slot validation successful');
  return { isValid: true };
}

/**
 * Calculate duration in hours between two times
 * @param {string} startTime - Start time (HH:MM format)
 * @param {string} endTime - End time (HH:MM format)
 * @returns {number} - Duration in hours
 */
export function calculateDuration(startTime, endTime) {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Check if a booking date is valid (not in the past)
 * @param {string} bookingDate - Date in YYYY-MM-DD format
 * @returns {Object} - Validation result with isValid and error message
 */
export function validateBookingDate(bookingDate) {
  if (!bookingDate) {
    return { isValid: false, error: 'Booking date is required' };
  }
  
  const bookingDateTime = new Date(bookingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDateTime < today) {
    return { isValid: false, error: 'Cannot book for past dates' };
  }
  
  return { isValid: true };
}

/**
 * Check if a time slot is valid for today (not in the past)
 * @param {string} timeSlot - Time slot in "HH:MM-HH:MM" format
 * @param {string} bookingDate - Date in YYYY-MM-DD format
 * @returns {Object} - Validation result with isValid and error message
 */
export function validateTimeSlotForToday(timeSlot, bookingDate) {
  const today = new Date().toISOString().split('T')[0];
  
  if (bookingDate === today) {
    const [startTime] = timeSlot.split('-');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (startHour < currentHour || (startHour === currentHour && startMinute <= currentMinute)) {
      return { isValid: false, error: 'Cannot book time slots in the past' };
    }
  }
  
  return { isValid: true };
}

/**
 * Generate a unique booking ID
 * @returns {string} - Unique booking ID
 */
export function generateBookingId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BC${timestamp}${random}`.toUpperCase();
} 