const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Alert thresholds & notification preferences
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get current user's threshold & notification settings
 *     tags: [Settings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Settings fetched }
 *   put:
 *     summary: Update threshold & notification settings
 *     tags: [Settings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               thermalTriggerTemp: { type: number, example: 49.0 }
 *               criticalSohThreshold: { type: number, example: 35.0 }
 *               alertRefreshInterval: { type: number, example: 8 }
 *               emailAlerts: { type: boolean, example: true }
 *               soundAlerts: { type: boolean, example: false }
 *               autoIsolate: { type: boolean, example: false }
 *     responses:
 *       200: { description: Settings saved successfully }
 */
router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
