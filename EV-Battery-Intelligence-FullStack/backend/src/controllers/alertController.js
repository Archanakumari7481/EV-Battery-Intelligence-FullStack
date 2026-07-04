const Alert = require('../models/Alert');
const asyncHandler = require('../middleware/asyncHandler');
const sendResponse = require('../utils/apiResponse');

// @desc    Get alerts feed (most recent first)
// @route   GET /api/alerts?limit=7&severity=critical
// @access  Private
const getAlerts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const filter = {};
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId.toUpperCase();

  const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(limit);
  sendResponse(res, 200, 'Alerts fetched', alerts);
});

// @desc    Create a new alert (also used by simulator / IoT devices)
// @route   POST /api/alerts
// @access  Private
const createAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.create(req.body);
  req.io.emit('alert:new', alert);
  sendResponse(res, 201, 'Alert created', alert);
});

// @desc    Acknowledge an alert
// @route   PATCH /api/alerts/:id/acknowledge
// @access  Private
const acknowledgeAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { acknowledged: true },
    { new: true }
  );
  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }
  sendResponse(res, 200, 'Alert acknowledged', alert);
});

// @desc    Notify technician about a vehicle's issue
// @route   POST /api/alerts/notify-technician
// @access  Private
const notifyTechnician = asyncHandler(async (req, res) => {
  const { vehicleId } = req.body;
  if (!vehicleId) {
    res.status(400);
    throw new Error('vehicleId is required');
  }

  // In a real system this would trigger SMS/email/push to the on-call technician.
  req.io.emit('technician:notified', { vehicleId, notifiedAt: new Date() });

  sendResponse(res, 200, 'Technician notified via edge network', { vehicleId });
});

// @desc    Get alert counts grouped by severity (for dashboard cards)
// @route   GET /api/alerts/stats
// @access  Private
const getAlertStats = asyncHandler(async (req, res) => {
  const stats = await Alert.aggregate([
    { $group: { _id: '$severity', count: { $sum: 1 } } },
  ]);

  const result = { critical: 0, warning: 0, info: 0 };
  stats.forEach((s) => {
    result[s._id] = s.count;
  });

  sendResponse(res, 200, 'Alert stats fetched', result);
});

module.exports = { getAlerts, createAlert, acknowledgeAlert, notifyTechnician, getAlertStats };
