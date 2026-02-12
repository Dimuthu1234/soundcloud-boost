const { client, paypal } = require('../config/paypal');

const createPayPalOrder = async (amount, currency = 'USD', description = 'SoundCloudBoost Package') => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description,
      },
    ],
    application_context: {
      brand_name: 'SoundCloudBoost',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    },
  });

  try {
    const response = await client().execute(request);
    return {
      success: true,
      orderId: response.result.id,
      status: response.result.status,
      links: response.result.links,
      approvalUrl: response.result.links.find((link) => link.rel === 'approve')?.href,
    };
  } catch (error) {
    console.error('PayPal create order error:', error);
    return { success: false, error: error.message };
  }
};

const capturePayPalOrder = async (paypalOrderId) => {
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});

  try {
    const response = await client().execute(request);
    const capture = response.result.purchase_units[0]?.payments?.captures?.[0];

    return {
      success: true,
      captureId: capture?.id,
      status: response.result.status,
      payerId: response.result.payer?.payer_id,
      payerEmail: response.result.payer?.email_address,
      amount: capture?.amount?.value,
      currency: capture?.amount?.currency_code,
    };
  } catch (error) {
    console.error('PayPal capture order error:', error);
    return { success: false, error: error.message };
  }
};

const getPayPalOrderDetails = async (paypalOrderId) => {
  const request = new paypal.orders.OrdersGetRequest(paypalOrderId);

  try {
    const response = await client().execute(request);
    return { success: true, order: response.result };
  } catch (error) {
    console.error('PayPal get order error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails,
};
