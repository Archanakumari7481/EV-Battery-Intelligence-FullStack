const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: AI-generated predictive maintenance recommendations
 */

/**
 * @swagger
 * /maintenance/recommendations:
 *   get:
 *     summary: Get all maintenance recommendations
 *     tags: [Maintenance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: resolved
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Recommendations list }
 *   post:
 *     summary: Create a new maintenance recommendation
 *     tags: [Maintenance]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, component, issue, urgency, urgencyText, action, cost, confidence]
 *             properties:
 *               vehicleId: { type: string, example: EV-003 }
 *               component: { type: string, example: "Battery Pack" }
 *               icon: { type: string, example: "Battery" }
 *               issue: { type: string, example: "Cell group 4 degrading rapidly" }
 *               urgency: { type: string, enum: [Critical, High, Medium, Low] }
 *               urgencyText: { type: string, example: "Act within 3 days" }
 *               action: { type: string, example: "Replace cell group 4 immediately" }
 *               cost: { type: number, example: 45000 }
 *               confidence: { type: number, example: 94 }
 *     responses:
 *       201: { description: Recommendation created }
 */
router.get('/recommendations', getRecommendations);
router.post('/recommendations', createRecommendation);

/**
 * @swagger
 * /maintenance/recommendations/{id}:
 *   patch:
 *     summary: Update a recommendation (e.g. confidence score, mark resolved)
 *     tags: [Maintenance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Recommendation updated }
 *   delete:
 *     summary: Delete a recommendation
 *     tags: [Maintenance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Recommendation deleted }
 */
router.patch('/recommendations/:id', updateRecommendation);
router.delete('/recommendations/:id', deleteRecommendation);

module.exports = router;
