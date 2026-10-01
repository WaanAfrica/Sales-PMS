import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAchievement,
  calculateAchievementPercent,
  calculateChangeAgainstPreviousDay,
  calculateVariance,
  calculateWinRate,
  calculateDailyAcquisition,
  calculateMonthlyAcquisition,
  calculateMonthToDateRevenue,
  calculateDailyReportModel,
  calculateMonthlyReportModel,
} from './reporting';

test('calculateVariance returns amount and percentage safely', () => {
  assert.deepEqual(calculateVariance(120000, 100000), { amount: 20000, percentage: 20 });
  assert.deepEqual(calculateVariance(50000, 100000), { amount: -50000, percentage: -50 });
  assert.deepEqual(calculateVariance(0, 0), { amount: 0, percentage: '-' });
});

test('achievement displays a safe value for zero targets', () => {
  assert.equal(calculateAchievement(1000, 0), '-');
  assert.equal(calculateAchievementPercent(1000, 0), '-');
  assert.equal(calculateAchievement(1000, 1000), '100%');
});

test('change against previous day uses a safe value for missing denominators', () => {
  assert.equal(calculateChangeAgainstPreviousDay(10, 0), '-');
  assert.equal(calculateChangeAgainstPreviousDay(10, undefined), '-');
  assert.equal(calculateChangeAgainstPreviousDay(20, 10), '100%');
});

test('win rate uses a safe value when no quotations exist', () => {
  assert.equal(calculateWinRate(0, 0), '-');
  assert.equal(calculateWinRate(4, 8), '50%');
});

test('calculateDailyAcquisition derives count from new customers and walk-ins', () => {
  assert.equal(calculateDailyAcquisition(3, 4), 7);
  assert.equal(calculateDailyAcquisition(0, 0), 0);
  assert.equal(calculateDailyAcquisition(10, 5), 15);
  assert.equal(calculateDailyAcquisition(null, Number.NaN), 0);
});

test('calculateMonthlyAcquisition sums submitted daily acquisition through the report date', () => {
  const reports = [
    { date: '2026-10-01', status: 'SUBMITTED' as const, newCustomers: 4, walkIns: 2 },
    { date: '2026-10-02', status: 'SUBMITTED' as const, newCustomers: 2, walkIns: 2 },
    { date: '2026-10-03', status: 'SUBMITTED' as const, newCustomers: 4, walkIns: 3 },
    { date: '2026-10-03', status: 'DRAFT' as const, newCustomers: 100, walkIns: 100 },
    { date: '2026-10-04', status: 'SUBMITTED' as const, newCustomers: 50, walkIns: 50 },
    { date: '2026-09-30', status: 'SUBMITTED' as const, newCustomers: 50, walkIns: 50 },
  ];

  assert.equal(calculateMonthlyAcquisition(reports, '2026-10-03'), 17);
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

test('daily and monthly reports do not treat legacy quotation age as calculated data', () => {
  const report = {
    id: 'report-1',
    userId: 'sales-1',
    date: '2026-10-01',
    salesRevenue: 50_000,
    repeatCustomers: 1,
    newCustomers: 4,
    walkIns: 2,
    dailyAcquisition: 6,
    newQuotations: 3,
    closedQuotations: 1,
    quotationAge: 17,
    hotQuotationValue: 0,
    salesPipelineValue: 0,
    accountsReceivable: 0,
    opportunities: null,
    challenges: null,
    status: 'SUBMITTED' as const,
    submittedAt: new Date('2026-10-01T08:00:00Z'),
    updatedAt: new Date('2026-10-01T08:00:00Z'),
  };
  const activeUsers = [{ id: 'sales-1', name: 'Sales Person' }];

  const daily = calculateDailyReportModel({
    reportDate: new Date('2026-10-01T00:00:00Z'),
    activeUsers,
    reports: [report],
    monthToDateReports: [report],
    targets: [],
    previousReportsByUser: new Map(),
  });
  const monthly = calculateMonthlyReportModel({
    month: 10,
    year: 2026,
    activeUsers,
    reports: [report],
    targets: [],
  });

  assert.equal(daily.rows[0].quotationSummary.averageAge, '-');
  assert.equal(monthly.rows[0].quotationSummary.averageAge, '-');
});

test('daily team totals preserve submitted MTD revenue when today is not submitted', () => {
  const report = {
    id: 'report-1',
    userId: 'sales-1',
    date: '2026-10-01',
    salesRevenue: 50_000,
    repeatCustomers: 1,
    newCustomers: 4,
    walkIns: 2,
    dailyAcquisition: 6,
    newQuotations: 3,
    closedQuotations: 1,
    quotationAge: 17,
    hotQuotationValue: 10_000,
    salesPipelineValue: 20_000,
    accountsReceivable: 5_000,
    opportunities: null,
    challenges: null,
    status: 'SUBMITTED' as const,
    submittedAt: new Date('2026-10-01T08:00:00Z'),
    updatedAt: new Date('2026-10-01T08:00:00Z'),
  };
  const model = calculateDailyReportModel({
    reportDate: new Date('2026-10-02T00:00:00Z'),
    activeUsers: [{ id: 'sales-1', name: 'Sales Person' }],
    reports: [],
    monthToDateReports: [report],
    targets: [],
    previousReportsByUser: new Map(),
  });

  assert.equal(model.rows[0].status, 'Not Submitted');
  assert.equal(model.rows[0].revenueSummary.actual, 50_000);
  assert.equal(model.teamTotals.actual, 50_000);
  assert.equal(model.teamTotals.monthlyAcquisition, 6);
  assert.equal(model.rows[0].revenueSummary.previousDay, '-');
});
