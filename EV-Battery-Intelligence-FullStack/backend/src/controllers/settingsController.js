const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');
const sendResponse = require('../utils/apiResponse');

// @desc    Get current user's alert threshold & notification settings
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ user: req.user._id });

  // Auto-create defaults if somehow missing (e.g. legacy account)
  if (!settings) {
    settings = await Settings.create({ user: req.user._id });
  }

  sendResponse(res, 200, 'Settings fetched', settings);
});

// @desc    Update settings (thresholds, toggles)
// @route   PUT /api/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
  const allowedFields = [
    'thermalTriggerTemp',
    'criticalSohThreshold',
    'alertRefreshInterval',
    'emailAlerts',
    'soundAlerts',
    'autoIsolate',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const settings = await Settings.findOneAndUpdate({ user: req.user._id }, updates, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  req.io.emit('settings:update', settings);

  sendResponse(res, 200, 'Settings saved successfully', settings);
});

module.exports = { getSettings, updateSettings };
