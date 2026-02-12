const prisma = require('../config/database');
const { createPayPalOrder, capturePayPalOrder } = require('../services/paypalService');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');

// POST - Create order and initiate PayPal payment
const createOrder = async (req, res) => {
  try {
    const { packageId, customerEmail, customerName, soundcloudUrl, quantity } = req.body;

    // Validate package exists
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    if (!pkg.isActive) {
      return res.status(400).json({ error: 'This package is no longer available.' });
    }

    const qty = parseInt(quantity, 10) || 1;
    const totalPrice = pkg.price * qty;

    // Create order in database with pending status
    const order = await prisma.order.create({
      data: {
        customerEmail,
        customerName: customerName || null,
        soundcloudUrl,
        quantity: qty,
        totalPrice,
        status: 'pending',
        packageId: pkg.id,
      },
      include: { package: true },
    });

    // Create PayPal order
    const paypalResult = await createPayPalOrder(
      totalPrice,
      'USD',
      `SoundCloudBoost - ${pkg.title} x${qty}`
    );

    if (!paypalResult.success) {
      // Update order to failed if PayPal order creation fails
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'pending' },
      });
      return res.status(500).json({ error: 'Failed to create PayPal order.', details: paypalResult.error });
    }

    // Create payment record linked to order
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paypalOrderId: paypalResult.orderId,
        amount: totalPrice,
        currency: 'USD',
        status: 'pending',
      },
    });

    res.status(201).json({
      message: 'Order created. Redirect to PayPal for payment.',
      order: {
        id: order.id,
        status: order.status,
        totalPrice: order.totalPrice,
        package: pkg.title,
      },
      paypal: {
        orderId: paypalResult.orderId,
        approvalUrl: paypalResult.approvalUrl,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
};

// POST - Capture PayPal payment after user approves
const capturePayment = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    // Find payment by PayPal order ID
    const payment = await prisma.payment.findFirst({
      where: { paypalOrderId },
      include: { order: { include: { package: true } } },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ error: 'Payment already captured.' });
    }

    // Capture the PayPal payment
    const captureResult = await capturePayPalOrder(paypalOrderId);

    if (!captureResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'pending' },
      });
      return res.status(500).json({ error: 'Failed to capture PayPal payment.', details: captureResult.error });
    }

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paypalCaptureId: captureResult.captureId,
        paypalPayerId: captureResult.payerId,
        status: 'completed',
        paidAt: new Date(),
      },
    });

    // Update order status to 'paid'
    const updatedOrder = await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'paid' },
      include: { package: true },
    });

    // Send confirmation email
    await sendOrderConfirmationEmail(updatedOrder, updatedOrder.package);

    res.json({
      message: 'Payment captured successfully. Order is now paid.',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        totalPrice: updatedOrder.totalPrice,
        package: updatedOrder.package.title,
        customerEmail: updatedOrder.customerEmail,
      },
      payment: {
        id: updatedPayment.id,
        captureId: updatedPayment.paypalCaptureId,
        status: updatedPayment.status,
        paidAt: updatedPayment.paidAt,
      },
    });
  } catch (error) {
    console.error('Capture payment error:', error);
    res.status(500).json({ error: 'Failed to capture payment.' });
  }
};

// GET - Get order by ID (public - by email verification)
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { package: true, payment: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
};

// GET - Get orders by customer email
const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      include: { package: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders by email error:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

// GET - Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { package: true, payment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

// PUT - Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { package: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { package: true },
    });

    // Send status update email
    if (status !== order.status) {
      await sendOrderStatusUpdateEmail(updatedOrder, updatedOrder.package, status);
    }

    res.json({ message: `Order status updated to ${status}.`, order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
};

// GET - Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, paidOrders, completedOrders, totalIncome, totalPackages] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.order.count({ where: { status: 'paid' } }),
        prisma.order.count({ where: { status: 'completed' } }),
        prisma.payment.aggregate({
          where: { status: 'completed' },
          _sum: { amount: true },
        }),
        prisma.package.count({ where: { isActive: true } }),
      ]);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        paidOrders,
        completedOrders,
        totalIncome: totalIncome._sum.amount || 0,
        totalPackages,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getOrderById,
  getOrdersByEmail,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
