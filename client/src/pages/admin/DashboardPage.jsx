import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShoppingCart,
  FaCreditCard,
  FaCheckCircle,
  FaDollarSign,
  FaArrowRight,
  FaClock,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getDashboardStats, getAllOrders } from '../../services/api';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  paid: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getDashboardStats(),
        getAllOrders({ limit: 5, page: 1 }),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.orders || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          label: 'Total Orders',
          value: stats.totalOrders ?? 0,
          icon: FaShoppingCart,
          color: 'orange',
          bg: 'bg-orange-500/10',
          text: 'text-orange-500',
          border: 'border-orange-500/20',
          shadow: 'shadow-orange-500/5',
        },
        {
          label: 'Paid Orders',
          value: stats.paidOrders ?? 0,
          icon: FaCreditCard,
          color: 'blue',
          bg: 'bg-blue-500/10',
          text: 'text-blue-500',
          border: 'border-blue-500/20',
          shadow: 'shadow-blue-500/5',
        },
        {
          label: 'Completed Orders',
          value: stats.completedOrders ?? 0,
          icon: FaCheckCircle,
          color: 'green',
          bg: 'bg-green-500/10',
          text: 'text-green-500',
          border: 'border-green-500/20',
          shadow: 'shadow-green-500/5',
        },
        {
          label: 'Total Income',
          value: `$${(stats.totalIncome ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          icon: FaDollarSign,
          color: 'purple',
          bg: 'bg-purple-500/10',
          text: 'text-purple-500',
          border: 'border-purple-500/20',
          shadow: 'shadow-purple-500/5',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your business</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-200 shadow-lg ${card.shadow}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} ${card.border} border rounded-xl flex items-center justify-center`}>
                <card.icon className={`text-xl ${card.text}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-gray-500 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <p className="text-gray-500 text-sm mt-0.5">Latest 5 orders</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            View All <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <FaShoppingCart className="text-gray-700 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300 font-mono">
                        {order.id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{order.customerEmail}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white font-medium">
                        ${order.totalPrice?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[order.status] || statusColors.pending}`}
                      >
                        <FaClock className="text-[10px]" />
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
