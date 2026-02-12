const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  capturePayment,
  getOrderById,
  getOrdersByEmail,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { authenticateAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public routes
// POST /api/orders - Create order + initiate PayPal payment
router.post(
  '/',
  [
    body('packageId').notEmpty().withMessage('Package ID is required.'),
    body('customerEmail').isEmail().withMessage('Valid email is required.'),
    body('soundcloudUrl').isURL().withMessage('Valid SoundCloud URL is required.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  validate,
  createOrder
);

// POST /api/orders/capture - Capture PayPal payment after approval
router.post(
  '/capture',
  [body('paypalOrderId').notEmpty().withMessage('PayPal Order ID is required.')],
  validate,
  capturePayment
);

// GET /api/orders/history?email=xxx - Get order history by email
router.get('/history', getOrdersByEmail);

// GET /api/orders/:id - Get single order
router.get('/:id', getOrderById);

// Admin routes (protected)
// GET /api/orders/admin/all - Get all orders (admin)
router.get('/admin/all', authenticateAdmin, getAllOrders);

// GET /api/orders/admin/stats - Dashboard stats
router.get('/admin/stats', authenticateAdmin, getDashboardStats);

// PUT /api/orders/admin/:id/status - Update order status
router.put(
  '/admin/:id/status',
  authenticateAdmin,
  [body('status').isIn(['pending', 'paid', 'completed']).withMessage('Invalid status.')],
  validate,
  updateOrderStatus
);

module.exports = router;
