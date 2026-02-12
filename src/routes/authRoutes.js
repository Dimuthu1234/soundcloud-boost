const express = require('express');
const { body } = require('express-validator');
const { registerAdmin, loginAdmin, getAdminProfile } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('name').notEmpty().withMessage('Name is required.'),
  ],
  validate,
  registerAdmin
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  loginAdmin
);

// GET /api/auth/profile
router.get('/profile', authenticateAdmin, getAdminProfile);

module.exports = router;
