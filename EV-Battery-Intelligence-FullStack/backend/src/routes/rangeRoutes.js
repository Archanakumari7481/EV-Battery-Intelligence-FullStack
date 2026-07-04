const express = require('express');
const router = express.Router();
const { getRangePredictions, calculateRange } = require('../controllers/rangeController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Range Predictor
 *   description: Predicted driving range based on SOC, temperature & battery health
 */

/**
 * @swagger
 * /range-predictions:
 *   get:
 *     summary: Get live range predictions for every vehicle
 *     tags: [Range Predictor]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Range predictions for all vehicles }
 */
router.get('/', getRangePredictions);

/**
 * @swagger
 * /range-predictions/calculate:
 *   post:
 *     summary: Calculate a one-off range prediction from custom inputs
 *     tags: [Range Predictor]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [batteryPercent, temperature, healthScore]
 *             properties:
 *               batteryPercent: { type: number, example: 72 }
 *               temperature: { type: number, example: 42.8 }
 *               healthScore: { type: number, example: 61 }
 *               baseRangeKm: { type: number, example: 400 }
 *     responses:
 *       200: { description: Predicted range & status }
 */
router.post('/calculate', calculateRange);

module.exports = router;
