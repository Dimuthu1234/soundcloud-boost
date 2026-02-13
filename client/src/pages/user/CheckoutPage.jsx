import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackageById, createOrder } from '../../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: '',
    name: '',
    soundcloudUrl: '',
    quantity: 1,
  });

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  const fetchPackage = async () => {
    try {
      const { data } = await getPackageById(packageId);
      setPkg(data.package || data);
    } catch (err) {
      toast.error('Failed to load package details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const totalPrice = pkg ? (pkg.price * form.quantity).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!form.soundcloudUrl.trim()) {
      toast.error('SoundCloud URL is required');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await createOrder({
        packageId,
        customerEmail: form.email,
        customerName: form.name,
        soundcloudUrl: form.soundcloudUrl,
        quantity: form.quantity,
      });

      const order = data.order || data;
      const approvalUrl = data.paypal?.approvalUrl;

      if (!approvalUrl) {
        toast.error('Failed to get PayPal payment URL');
        setSubmitting(false);
        return;
      }

      // Save order ID for after PayPal redirect
      localStorage.setItem('pendingOrderId', order.id);

      // Redirect to PayPal for payment approval
      window.location.href = approvalUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="min-h-screen bg-darker py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors mb-4 inline-flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
          <p className="mt-1 text-gray-400">Complete your order details below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-3">
            <div className="bg-dark rounded-2xl border border-gray-800 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Order Details</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-darker border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-darker border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SoundCloud URL <span className="text-primary">*</span>
                  </label>
                  <input
                    type="url"
                    name="soundcloudUrl"
                    value={form.soundcloudUrl}
                    onChange={handleChange}
                    required
                    placeholder="https://soundcloud.com/your-profile"
                    className="w-full px-4 py-3 rounded-xl bg-darker border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl bg-darker border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Redirecting to PayPal...
                    </span>
                  ) : (
                    `Proceed to Payment - $${totalPrice}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Package Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-dark rounded-2xl border border-gray-800 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-4">Package Summary</h2>

              {pkg.image && (
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}

              <h3 className="text-xl font-bold text-white mb-3">{pkg.title}</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white font-medium">{pkg.category}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Price</span>
                  <span className="text-primary font-semibold">${pkg.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-white font-medium">{pkg.deliveryDays || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white font-medium">{form.quantity}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
