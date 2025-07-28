/**
 * Test script for overlap detection logic
 */

import { doTimeRangesOverlap } from './lib/bookingUtils.js';

console.log('Testing overlap detection logic...\n');

// Test cases
const testCases = [
  {
    name: 'No overlap - sequential slots',
    slot1: { start: '10:00', end: '12:00' },
    slot2: { start: '12:00', end: '14:00' },
    expected: false
  },
  {
    name: 'No overlap - different times',
    slot1: { start: '10:00', end: '12:00' },
    slot2: { start: '14:00', end: '16:00' },
    expected: false
  },
  {
    name: 'Overlap - new booking starts during existing',
    slot1: { start: '10:00', end: '12:00' },
    slot2: { start: '11:00', end: '13:00' },
    expected: true
  },
  {
    name: 'Overlap - new booking ends during existing',
    slot1: { start: '10:00', end: '12:00' },
    slot2: { start: '09:00', end: '11:00' },
    expected: true
  },
  {
    name: 'Overlap - new booking contains existing',
    slot1: { start: '10:00', end: '12:00' },
    slot2: { start: '09:00', end: '13:00' },
    expected: true
  },
  {
    name: 'Overlap - existing booking contains new',
    slot1: { start: '09:00', end: '13:00' },
    slot2: { start: '10:00', end: '12:00' },
    expected: true
  },
  {
    name: 'Exact same time',
    slot1: { start: '10:00', end: '12:00' },
    slot2: { start: '10:00', end: '12:00' },
    expected: true
  },
  {
    name: 'Edge case - touching but not overlapping',
    slot1: { start: '10:00', end: '12:00' },
    slot2: { start: '12:00', end: '14:00' },
    expected: false
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = doTimeRangesOverlap(
    testCase.slot1.start, 
    testCase.slot1.end, 
    testCase.slot2.start, 
    testCase.slot2.end
  );
  
  const status = result === testCase.expected ? 'PASS' : 'FAIL';
  if (result === testCase.expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Slot 1: ${testCase.slot1.start}-${testCase.slot1.end}`);
  console.log(`   Slot 2: ${testCase.slot2.start}-${testCase.slot2.end}`);
  console.log(`   Expected: ${testCase.expected}, Got: ${result} - ${status}\n`);
});

console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
console.log(failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed!'); 