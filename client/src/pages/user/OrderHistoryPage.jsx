import { useState } from 'react';
import { getOrdersByEmail } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function OrderHistoryPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data } = await getOrdersByEmail(email);
      setOrders(data.orders || data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-darker py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Order <span className="text-primary">History</span>
          </h1>
          <p className="mt-3 text-gray-400 text-lg">
            Enter your email to view your past orders
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3.5 rounded-xl bg-dark border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-primary animate-spin" />
          </div>
        ) : searched && orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
            <p className="text-gray-400">
              No orders were found for this email address. Please check your email and try again.
            </p>
          </div>
        ) : orders.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="bg-darker hover:bg-dark/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">
                          {order.id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {order.package?.title || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-primary font-semibold">
                          ${order.totalPrice?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            STATUS_STYLES[order.status] || STATUS_STYLES.pending
                          }`}
                        >
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-dark rounded-2xl border border-gray-800 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-mono text-sm">
                      #{order.id?.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        STATUS_STYLES[order.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    {order.package?.title || 'N/A'}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-lg">
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
