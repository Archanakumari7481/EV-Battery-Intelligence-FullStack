const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  isolateVehicle,
  deleteVehicle,
  getDegradationHistory,
  getFleetSummary,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // every vehicle route requires login

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Fleet vehicle telemetry & battery health
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all vehicles in the fleet
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of vehicles }
 *   post:
 *     summary: Add a new vehicle to the fleet
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId]
 *             properties:
 *               vehicleId: { type: string, example: "EV-005" }
 *               healthScore: { type: number, example: 95 }
 *               soc: { type: number, example: 90 }
 *               temp: { type: number, example: 30 }
 *               voltage: { type: number, example: 400 }
 *               cycles: { type: number, example: 10 }
 *               location: { type: object, properties: { lat: {type: number}, lng: {type: number}, city: {type: string} } }
 *     responses:
 *       201: { description: Vehicle added }
 */
router.get('/', getVehicles);
router.post('/', authorize('admin', 'fleet_manager'), createVehicle);

/**
 * @swagger
 * /vehicles/summary:
 *   get:
 *     summary: Get fleet-wide dashboard summary (avg health, critical count...)
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Fleet summary }
 */
router.get('/summary', getFleetSummary);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get a single vehicle by ID (e.g. EV-001)
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: EV-001
 *     responses:
 *       200: { description: Vehicle data }
 *       404: { description: Vehicle not found }
 *   patch:
 *     summary: Update vehicle telemetry / details
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: EV-001
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               soc: { type: number }
 *               temp: { type: number }
 *               healthScore: { type: number }
 *               voltage: { type: number }
 *     responses:
 *       200: { description: Vehicle updated }
 *   delete:
 *     summary: Remove a vehicle from the fleet
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vehicle removed }
 */
router.get('/:id', getVehicleById);
router.patch('/:id', updateVehicle);
router.delete('/:id', authorize('admin'), deleteVehicle);

/**
 * @swagger
 * /vehicles/{id}/isolate:
 *   patch:
 *     summary: Isolate a vehicle from the grid (thermal-runaway safety action)
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: EV-003
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               autoIsolated: { type: boolean, example: false }
 *     responses:
 *       200: { description: Vehicle isolated successfully }
 */
router.patch('/:id/isolate', isolateVehicle);

/**
 * @swagger
 * /vehicles/{id}/degradation:
 *   get:
 *     summary: Get 12-month battery capacity degradation history for a vehicle
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: EV-001
 *     responses:
 *       200: { description: Degradation history array }
 */
router.get('/:id/degradation', getDegradationHistory);

module.exports = router;
