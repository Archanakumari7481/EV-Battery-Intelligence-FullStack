const Recommendation = require('../models/Recommendation');
const asyncHandler = require('../middleware/asyncHandler');
const sendResponse = require('../utils/apiResponse');

// @desc    Get all AI maintenance recommendations
// @route   GET /api/maintenance/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.resolved !== undefined) filter.resolved = req.query.resolved === 'true';

  const recommendations = await Recommendation.find(filter).sort({ createdAt: -1 });
  sendResponse(res, 200, 'Maintenance recommendations fetched', recommendations);
});

// @desc    Create a new maintenance recommendation
// @route   POST /api/maintenance/recommendations
// @access  Private
const createRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await Recommendation.create(req.body);
  req.io.emit('recommendation:new', recommendation);
  sendResponse(res, 201, 'Recommendation created', recommendation);
});

// @desc    Update a recommendation (e.g. confidence score, mark resolved)
// @route   PATCH /api/maintenance/recommendations/:id
// @access  Private
const updateRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await Recommendation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!recommendation) {
    res.status(404);
    throw new Error('Recommendation not found');
  }
  req.io.emit('recommendation:update', recommendation);
  sendResponse(res, 200, 'Recommendation updated', recommendation);
});

// @desc    Delete a recommendation
// @route   DELETE /api/maintenance/recommendations/:id
// @access  Private
const deleteRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await Recommendation.findByIdAndDelete(req.params.id);
  if (!recommendation) {
    res.status(404);
    throw new Error('Recommendation not found');
  }
  sendResponse(res, 200, 'Recommendation deleted', null);
});

module.exports = {
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
};
