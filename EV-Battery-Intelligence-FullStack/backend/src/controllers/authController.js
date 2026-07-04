const User = require('../models/User');
const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');
const generateToken = require('../utils/generateToken');
const sendResponse = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role });

  // Create default alert-threshold settings for this new user (matches Settings.jsx defaults)
  await Settings.create({ user: user._id });

  sendResponse(res, 201, 'Account created successfully', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id),
  });
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  sendResponse(res, 200, 'Login successful', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id),
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Profile fetched', { user: req.user });
});

module.exports = { registerUser, loginUser, getMe };
