const express = require('express');
const { handlePayPalWebhook } = require('../controllers/webhookController');

const router = express.Router();

// POST /api/webhooks/paypal
router.post('/paypal', handlePayPalWebhook);

module.exports = router;
