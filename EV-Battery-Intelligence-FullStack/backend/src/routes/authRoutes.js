const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration & login (JWT based)
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Monika Mandal" }
 *               email: { type: string, example: "monika@fleet.com" }
 *               password: { type: string, example: "secret123" }
 *               role: { type: string, enum: [admin, fleet_manager, technician, viewer], example: "fleet_manager" }
 *     responses:
 *       201: { description: Account created successfully }
 *       409: { description: Email already registered }
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "monika@fleet.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       200: { description: Login successful, returns JWT token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the logged-in user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile fetched }
 *       401: { description: Not authorized }
 */
router.get('/me', protect, getMe);

module.exports = router;
