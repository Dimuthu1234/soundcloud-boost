const prisma = require('../config/database');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// POST - Handle PayPal webhook events
const handlePayPalWebhook = async (req, res) => {
  try {
    const event = req.body;

    console.log('PayPal Webhook Event:', event.event_type);
    console.log('PayPal Webhook Resource:', JSON.stringify(event.resource, null, 2));

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        const paypalOrderId = event.resource.id;
        const payment = await prisma.payment.findFirst({
          where: { paypalOrderId },
        });

        if (payment) {
          console.log(`Order ${paypalOrderId} approved via webhook`);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        const captureId = event.resource.id;
        const paypalOrderId = event.resource.supplementary_data?.related_ids?.order_id;

        if (paypalOrderId) {
          const payment = await prisma.payment.findFirst({
            where: { paypalOrderId },
            include: { order: { include: { package: true } } },
          });

          if (payment && payment.status !== 'completed') {
            // Update payment
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                paypalCaptureId: captureId,
                status: 'completed',
                paidAt: new Date(),
              },
            });

            // Update order status
            const updatedOrder = await prisma.order.update({
              where: { id: payment.orderId },
              data: { status: 'paid' },
              include: { package: true },
            });

            // Send confirmation email
            await sendOrderConfirmationEmail(updatedOrder, updatedOrder.package);

            console.log(`Payment captured for order ${payment.orderId} via webhook`);
          }
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const captureId = event.resource.id;
        const payment = await prisma.payment.findFirst({
          where: { paypalCaptureId: captureId },
        });

        if (payment) {
          const newStatus = event.event_type === 'PAYMENT.CAPTURE.REFUNDED' ? 'refunded' : 'failed';
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: newStatus },
          });

          await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'pending' },
          });

          console.log(`Payment ${newStatus} for order ${payment.orderId} via webhook`);
        }
        break;
      }

      default:
        console.log('Unhandled webhook event:', event.event_type);
    }

    // Always respond 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent PayPal from retrying
    res.status(200).json({ received: true });
  }
};

module.exports = { handlePayPalWebhook };
