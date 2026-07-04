const Vehicle = require('../models/Vehicle');
const Alert = require('../models/Alert');
const asyncHandler = require('../middleware/asyncHandler');
const sendResponse = require('../utils/apiResponse');

// @desc    Get all vehicles (fleet)
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().sort({ vehicleId: 1 });
  sendResponse(res, 200, 'Vehicles fetched', vehicles);
});

// @desc    Get single vehicle by vehicleId (e.g. EV-001)
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ vehicleId: req.params.id.toUpperCase() });
  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle ${req.params.id} not found`);
  }
  sendResponse(res, 200, 'Vehicle fetched', vehicle);
});

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private (admin, fleet_manager)
const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  sendResponse(res, 201, 'Vehicle added to fleet', vehicle);
});

// @desc    Update vehicle telemetry / details
// @route   PATCH /api/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { vehicleId: req.params.id.toUpperCase() },
    req.body,
    { new: true, runValidators: true }
  );
  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle ${req.params.id} not found`);
  }

  // Push live update to all connected dashboards
  req.io.emit('vehicle:update', vehicle);

  sendResponse(res, 200, 'Vehicle updated', vehicle);
});

// @desc    Isolate a vehicle from the grid (thermal runaway safety action)
// @route   PATCH /api/vehicles/:id/isolate
// @access  Private
const isolateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { vehicleId: req.params.id.toUpperCase() },
    { status: 'ISOLATED', isolatedAt: new Date() },
    { new: true }
  );
  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle ${req.params.id} not found`);
  }

  const autoIsolated = req.body.autoIsolated === true;

  const alert = await Alert.create({
    vehicleId: vehicle.vehicleId,
    message: autoIsolated
      ? `${vehicle.vehicleId} auto-isolated by Edge AI — no technician response detected`
      : `Grid Disconnection: ${vehicle.vehicleId} isolated successfully due to thermal threat.`,
    severity: 'critical',
    type: 'thermal',
  });

  req.io.emit('vehicle:update', vehicle);
  req.io.emit('alert:new', alert);

  sendResponse(res, 200, `${vehicle.vehicleId} isolated successfully`, { vehicle, alert });
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (admin)
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({ vehicleId: req.params.id.toUpperCase() });
  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle ${req.params.id} not found`);
  }
  sendResponse(res, 200, 'Vehicle removed from fleet', null);
});

// @desc    Get monthly capacity degradation history for a vehicle
// @route   GET /api/vehicles/:id/degradation
// @access  Private
const getDegradationHistory = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ vehicleId: req.params.id.toUpperCase() });
  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle ${req.params.id} not found`);
  }
  sendResponse(res, 200, 'Degradation history fetched', vehicle.degradationHistory);
});

// @desc    Get fleet-wide dashboard summary (avg health, critical count, etc.)
// @route   GET /api/vehicles/summary
// @access  Private
const getFleetSummary = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find();

  const avgHealth = vehicles.length
    ? Math.round(vehicles.reduce((sum, v) => sum + v.healthScore, 0) / vehicles.length)
    : 0;
  const criticalCount = vehicles.filter((v) => v.status === 'critical').length;
  const warningCount = vehicles.filter((v) => v.status === 'warning').length;
  const healthyCount = vehicles.filter((v) => v.status === 'healthy').length;
  const isolatedCount = vehicles.filter((v) => v.status === 'ISOLATED').length;

  sendResponse(res, 200, 'Fleet summary fetched', {
    totalVehicles: vehicles.length,
    avgHealth,
    criticalCount,
    warningCount,
    healthyCount,
    isolatedCount,
  });
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  isolateVehicle,
  deleteVehicle,
  getDegradationHistory,
  getFleetSummary,
};
