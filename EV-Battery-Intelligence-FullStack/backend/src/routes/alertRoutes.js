const express = require('express');
const router = express.Router();
const {
  getAlerts,
  createAlert,
  acknowledgeAlert,
  notifyTechnician,
  getAlertStats,
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Live fleet alerts feed
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get alerts feed (latest first)
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 7 }
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [critical, warning, info] }
 *       - in: query
 *         name: vehicleId
 *         schema: { type: string, example: EV-003 }
 *     responses:
 *       200: { description: Alerts list }
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, message, severity]
 *             properties:
 *               vehicleId: { type: string, example: EV-003 }
 *               message: { type: string, example: "Thermal Runaway Risk: Cell Group 4 exceeded 49°C" }
 *               severity: { type: string, enum: [critical, warning, info] }
 *               type: { type: string, enum: [thermal, voltage, charging, nominal] }
 *     responses:
 *       201: { description: Alert created }
 */
router.get('/', getAlerts);
router.post('/', createAlert);

/**
 * @swagger
 * /alerts/stats:
 *   get:
 *     summary: Get alert counts grouped by severity
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Alert counts }
 */
router.get('/stats', getAlertStats);

/**
 * @swagger
 * /alerts/notify-technician:
 *   post:
 *     summary: Notify a technician about a vehicle issue
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId]
 *             properties:
 *               vehicleId: { type: string, example: EV-003 }
 *     responses:
 *       200: { description: Technician notified }
 */
router.post('/notify-technician', notifyTechnician);

/**
 * @swagger
 * /alerts/{id}/acknowledge:
 *   patch:
 *     summary: Acknowledge an alert
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Alert acknowledged }
 */
router.patch('/:id/acknowledge', acknowledgeAlert);

module.exports = router;
