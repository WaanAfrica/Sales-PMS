import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAchievementValue,
  calculateVariance,
  calculateChangeValue,
  calculateWinRateValue,
} from './reports';
import {
  calculateDailyAcquisition,
  calculateMonthlyAcquisition,
  calculateMonthToDateRevenue,
} from './reporting';

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

test('calculateDailyAcquisition derives count from new customers and walk-ins', () => {
  assert.equal(calculateDailyAcquisition(3, 4), 7);
  assert.equal(calculateDailyAcquisition(0, 0), 0);
  assert.equal(calculateDailyAcquisition(10, 5), 15);
  assert.equal(calculateDailyAcquisition(null, Number.NaN), 0);
});

test('calculateMonthlyAcquisition sums submitted daily acquisition through the report date', () => {
  const reports = [
    { date: '2026-10-01', status: 'SUBMITTED' as const, newCustomers: 3, walkIns: 2 },
    { date: '2026-10-02', status: 'SUBMITTED' as const, newCustomers: 4, walkIns: 3 },
    { date: '2026-10-03', status: 'SUBMITTED' as const, newCustomers: 2, walkIns: 1 },
    { date: '2026-10-03', status: 'DRAFT' as const, newCustomers: 100, walkIns: 100 },
    { date: '2026-10-04', status: 'SUBMITTED' as const, newCustomers: 50, walkIns: 50 },
    { date: '2026-09-30', status: 'SUBMITTED' as const, newCustomers: 50, walkIns: 50 },
  ];

  assert.equal(calculateMonthlyAcquisition(reports, '2026-10-03'), 15);
});

test('calculateMonthToDateRevenue sums submitted daily revenue through the report date', () => {
  const reports = [
    { date: '2026-10-01', status: 'SUBMITTED' as const, salesRevenue: 50_000 },
    { date: '2026-10-02', status: 'SUBMITTED' as const, salesRevenue: 70_000 },
    { date: '2026-10-03', status: 'SUBMITTED' as const, salesRevenue: 80_000 },
    { date: '2026-10-03', status: 'DRAFT' as const, salesRevenue: 100_000 },
  ];

  assert.equal(calculateMonthToDateRevenue(reports, '2026-10-03'), 200_000);
});
