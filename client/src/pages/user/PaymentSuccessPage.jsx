import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getOrderById, capturePayment } from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const captureAttempted = useRef(false);

  // PayPal sends 'token' (PayPal order ID) after redirect
  const paypalToken = searchParams.get('token');
  const orderId = searchParams.get('orderId') || localStorage.getItem('pendingOrderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [captureError, setCaptureError] = useState(false);

  useEffect(() => {
    handlePayment();
  }, []);

  const handlePayment = async () => {
    try {
      // If PayPal redirected back with token, capture the payment first
      if (paypalToken && !captureAttempted.current) {
        captureAttempted.current = true;
        try {
          await capturePayment({ paypalOrderId: paypalToken });
          localStorage.removeItem('pendingOrderId');
        } catch (err) {
          console.error('Capture error:', err);
          setCaptureError(true);
        }
      }

      // Fetch order details
      if (orderId) {
        const { data } = await getOrderById(orderId);
        setOrder(data.order || data);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (captureError) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8 inline-block">
            <div className="w-28 h-28 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Payment Processing Issue</h1>
          <p className="text-gray-400 text-lg mb-8">
            There was an issue processing your payment. Please contact support if the issue persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darker flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="relative mb-8 inline-block">
          <div className="w-28 h-28 rounded-full bg-green-500/10 flex items-center justify-center mx-auto animate-[bounceIn_0.6s_ease-out]">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          {/* Decorative dots */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full animate-ping" />
          <div className="absolute bottom-2 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping delay-200" />
          <div className="absolute top-4 right-2 w-2.5 h-2.5 bg-primary-light rounded-full animate-ping delay-500" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Payment Successful!
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Thank you for your purchase. Your order is being processed.
        </p>

        {/* Order Summary Card */}
        {order && (
          <div className="bg-dark rounded-2xl border border-gray-800 p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-800">
                <span className="text-gray-400">Order ID</span>
                <span className="text-white font-mono text-sm">
                  {order.id?.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-800">
                <span className="text-gray-400">Package</span>
                <span className="text-white font-medium">
                  {order.package?.title || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-800">
                <span className="text-gray-400">Total</span>
                <span className="text-primary font-bold text-lg">
                  ${order.totalPrice?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-400">Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'paid'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : order.status === 'completed'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Paid'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 cursor-pointer"
          >
            Track Your Order
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 rounded-xl text-white font-semibold border border-gray-700 hover:border-primary/50 hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
