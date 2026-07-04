const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../middleware/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const predictRange = require('../utils/rangePrediction');

// @desc    Get live range predictions for every vehicle in the fleet
// @route   GET /api/range-predictions
// @access  Private
const getRangePredictions = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find();

  const predictions = vehicles.map((v) => {
    const { predictedRange, status, severity } = predictRange(v.soc, v.temp, v.healthScore);
    return {
      vehicle: v.vehicleId,
      batteryPercent: v.soc,
      temperature: v.temp,
      predictedRange,
      status,
      severity,
    };
  });

  sendResponse(res, 200, 'Range predictions fetched', predictions);
});

// @desc    Calculate a one-off range prediction from custom inputs
// @route   POST /api/range-predictions/calculate
// @access  Private
const calculateRange = asyncHandler(async (req, res) => {
  const { batteryPercent, temperature, healthScore, baseRangeKm } = req.body;

  if ([batteryPercent, temperature, healthScore].some((v) => typeof v !== 'number')) {
    res.status(400);
    throw new Error('batteryPercent, temperature and healthScore (numbers) are required');
  }

  const result = predictRange(batteryPercent, temperature, healthScore, baseRangeKm || 400);
  sendResponse(res, 200, 'Range calculated', result);
});

module.exports = { getRangePredictions, calculateRange };
