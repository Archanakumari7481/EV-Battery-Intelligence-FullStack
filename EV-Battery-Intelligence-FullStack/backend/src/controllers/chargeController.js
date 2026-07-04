const ChargeSession = require('../models/ChargeSession');
const asyncHandler = require('../middleware/asyncHandler');
const sendResponse = require('../utils/apiResponse');

// @desc    Get charge session logs (with optional vehicle filter)
// @route   GET /api/charge-sessions?vehicleId=EV-001&limit=20
// @access  Private
const getChargeSessions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId.toUpperCase();
  const limit = parseInt(req.query.limit) || 50;

  const sessions = await ChargeSession.find(filter).sort({ date: -1 }).limit(limit);
  sendResponse(res, 200, 'Charge sessions fetched', sessions);
});

// @desc    Log a new charge session
// @route   POST /api/charge-sessions
// @access  Private
const createChargeSession = asyncHandler(async (req, res) => {
  const session = await ChargeSession.create(req.body);
  req.io.emit('charge-session:new', session);
  sendResponse(res, 201, 'Charge session logged', session);
});

// @desc    Weekly charge frequency per vehicle (for bar chart)
// @route   GET /api/charge-sessions/frequency
// @access  Private
const getChargeFrequency = asyncHandler(async (req, res) => {
  const sessions = await ChargeSession.find().sort({ date: 1 });

  // Group sessions into ISO week buckets per vehicle
  const weekMap = {};
  sessions.forEach((s) => {
    const weekKey = getWeekLabel(s.date);
    if (!weekMap[weekKey]) weekMap[weekKey] = {};
    weekMap[weekKey][s.vehicleId] = (weekMap[weekKey][s.vehicleId] || 0) + 1;
  });

  const result = Object.entries(weekMap).map(([week, counts]) => ({
    week,
    ...counts,
  }));

  sendResponse(res, 200, 'Charge frequency fetched', result);
});

// @desc    Average charge duration trend, split by DC Fast vs AC Slow
// @route   GET /api/charge-sessions/duration-trend
// @access  Private
const getDurationTrend = asyncHandler(async (req, res) => {
  const trend = await ChargeSession.aggregate([
    {
      $group: {
        _id: { date: { $dateToString: { format: '%m/%d', date: '$date' } }, type: '$type' },
        avgDuration: { $avg: '$duration' },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  const grouped = {};
  trend.forEach((t) => {
    const day = t._id.date;
    if (!grouped[day]) grouped[day] = { day };
    grouped[day][t._id.type === 'DC Fast' ? 'dc' : 'ac'] = Math.round(t.avgDuration);
  });

  sendResponse(res, 200, 'Duration trend fetched', Object.values(grouped));
});

function getWeekLabel(date) {
  const d = new Date(date);
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  return `Week ${weekNum}`;
}

module.exports = { getChargeSessions, createChargeSession, getChargeFrequency, getDurationTrend };
