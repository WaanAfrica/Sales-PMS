import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAchievementValue,
  calculateVariance,
  calculateChangeValue,
  calculateWinRateValue,
} from './reports';

test('calculateVariance returns amount and percentage safely', () => {
  assert.deepEqual(calculateVariance(120000, 100000), { amount: 20000, percentage: 20 });
  assert.deepEqual(calculateVariance(50000, 100000), { amount: -50000, percentage: -50 });
  assert.deepEqual(calculateVariance(0, 0), { amount: 0, percentage: 0 });
});

test('calculateAchievementValue handles zero targets safely', () => {
  assert.equal(calculateAchievementValue(1000, 0), 'N/A');
  assert.equal(calculateAchievementValue(1000, 1000), '100%');
});

test('calculateChangeValue returns N/A for missing or zero denominators', () => {
  assert.equal(calculateChangeValue(10, 0), 'N/A');
  assert.equal(calculateChangeValue(10, undefined as unknown as number), 'N/A');
  assert.equal(calculateChangeValue(20, 10), '100%');
});

test('calculateWinRateValue returns N/A when no quotations exist', () => {
  assert.equal(calculateWinRateValue(0, 0), 'N/A');
  assert.equal(calculateWinRateValue(4, 8), '50%');
});
