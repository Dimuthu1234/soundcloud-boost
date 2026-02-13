const axios = require('axios');

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const { data } = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return data.access_token;
}

const createPayPalOrder = async (amount, currency = 'USD', description = 'SoundCloudBoost Package') => {
  try {
    const accessToken = await getAccessToken();

    const { data } = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
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
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'SoundCloudBoost',
              landing_page: 'LOGIN',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: `${process.env.FRONTEND_URL}/payment/success`,
              cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const approvalUrl = data.links?.find((link) => link.rel === 'payer-action')?.href;

    return {
      success: true,
      orderId: data.id,
      status: data.status,
      links: data.links,
      approvalUrl,
    };
  } catch (error) {
    console.error('PayPal create order error:', error.response?.data || error.message);
    return { success: false, error: JSON.stringify(error.response?.data || error.message) };
  }
};

const capturePayPalOrder = async (paypalOrderId) => {
  try {
    const accessToken = await getAccessToken();

    const { data } = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      success: true,
      captureId: capture?.id,
      status: data.status,
      payerId: data.payer?.payer_id,
      payerEmail: data.payer?.email_address,
      amount: capture?.amount?.value,
      currency: capture?.amount?.currency_code,
    };
  } catch (error) {
    console.error('PayPal capture order error:', error.response?.data || error.message);
    return { success: false, error: JSON.stringify(error.response?.data || error.message) };
  }
};

const getPayPalOrderDetails = async (paypalOrderId) => {
  try {
    const accessToken = await getAccessToken();

    const { data } = await axios.get(
      `${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, order: data };
  } catch (error) {
    console.error('PayPal get order error:', error.response?.data || error.message);
    return { success: false, error: JSON.stringify(error.response?.data || error.message) };
  }
};

module.exports = {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails,
};
