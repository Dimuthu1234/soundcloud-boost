const transporter = require('../config/mailtrap');

const sendOrderConfirmationEmail = async (order, packageInfo) => {
  const mailOptions = {
    from: `"SoundCloudBoost" <${process.env.EMAIL_FROM}>`,
    to: order.customerEmail,
    subject: `Order Confirmed - ${packageInfo.title} | SoundCloudBoost`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #ff5500, #ff8800); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
          .header p { color: #ffe0cc; margin: 5px 0 0; }
          .content { padding: 30px; }
          .order-box { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff5500; }
          .order-box h3 { margin-top: 0; color: #333; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { color: #666; font-weight: 600; }
          .detail-value { color: #333; }
          .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
          .status-paid { background-color: #d4edda; color: #155724; }
          .total-row { font-size: 18px; font-weight: bold; color: #ff5500; border-bottom: none; padding-top: 12px; }
          .footer { background-color: #333; color: #999; text-align: center; padding: 20px; font-size: 12px; }
          .footer a { color: #ff5500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SoundCloudBoost</h1>
            <p>Order Confirmation</p>
          </div>
          <div class="content">
            <p>Hi <strong>${order.customerName || 'Customer'}</strong>,</p>
            <p>Thank you for your order! Your payment has been confirmed and we're now processing your request.</p>

            <div class="order-box">
              <h3>Order Details</h3>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${order.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Package:</span>
                <span class="detail-value">${packageInfo.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${packageInfo.category}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${order.quantity}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">SoundCloud URL:</span>
                <span class="detail-value">${order.soundcloudUrl}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Delivery Time:</span>
                <span class="detail-value">${packageInfo.deliveryDays} days</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge status-paid">PAID</span></span>
              </div>
              <div class="detail-row total-row">
                <span class="detail-label">Total Paid:</span>
                <span class="detail-value">$${order.totalPrice.toFixed(2)} USD</span>
              </div>
            </div>

            <p>We'll start working on your order right away. You'll receive updates as your order progresses.</p>
            <p>If you have any questions, feel free to contact us.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SoundCloudBoost. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

const sendOrderStatusUpdateEmail = async (order, packageInfo, newStatus) => {
  const statusMessages = {
    paid: 'Your payment has been confirmed! We are now processing your order.',
    completed: 'Great news! Your order has been completed successfully.',
  };

  const mailOptions = {
    from: `"SoundCloudBoost" <${process.env.EMAIL_FROM}>`,
    to: order.customerEmail,
    subject: `Order Update - ${newStatus.toUpperCase()} | SoundCloudBoost`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #ff5500, #ff8800); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .status-box { background-color: #d4edda; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .footer { background-color: #333; color: #999; text-align: center; padding: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SoundCloudBoost</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${order.customerName || 'Customer'}</strong>,</p>
            <div class="status-box">
              <h2>Order Status: ${newStatus.toUpperCase()}</h2>
              <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
            </div>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Package:</strong> ${packageInfo.title}</p>
            <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)} USD</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SoundCloudBoost. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Status update email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};
