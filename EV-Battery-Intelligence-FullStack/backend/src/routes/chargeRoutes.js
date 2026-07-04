const express = require('express');
const router = express.Router();
const {
  getChargeSessions,
  createChargeSession,
  getChargeFrequency,
  getDurationTrend,
} = require('../controllers/chargeController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Charge History
 *   description: EV charging session logs & analytics
 */

/**
 * @swagger
 * /charge-sessions:
 *   get:
 *     summary: Get charge session logs
 *     tags: [Charge History]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema: { type: string, example: EV-001 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 20 }
 *     responses:
 *       200: { description: Charge session list }
 *   post:
 *     summary: Log a new charging session
 *     tags: [Charge History]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, start, end, duration, energy, type]
 *             properties:
 *               vehicleId: { type: string, example: EV-001 }
 *               date: { type: string, format: date, example: "2026-06-28" }
 *               start: { type: number, example: 12 }
 *               end: { type: number, example: 88 }
 *               duration: { type: number, example: 42 }
 *               energy: { type: number, example: 54.7 }
 *               type: { type: string, enum: [DC Fast, AC Slow] }
 *     responses:
 *       201: { description: Session logged }
 */
router.get('/', getChargeSessions);
router.post('/', createChargeSession);

/**
 * @swagger
 * /charge-sessions/frequency:
 *   get:
 *     summary: Weekly charge frequency per vehicle (bar chart data)
 *     tags: [Charge History]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Weekly frequency data }
 */
router.get('/frequency', getChargeFrequency);

/**
 * @swagger
 * /charge-sessions/duration-trend:
 *   get:
 *     summary: Average charge duration trend (DC Fast vs AC Slow)
 *     tags: [Charge History]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Duration trend data }
 */
router.get('/duration-trend', getDurationTrend);

module.exports = router;
