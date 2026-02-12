import { useState, useEffect, useCallback } from 'react';
import {
  FaShoppingCart,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus } from '../../services/api';

const STATUS_TABS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'completed', label: 'Completed' },
];

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  paid: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const statusOptions = {
  pending: ['paid', 'completed'],
  paid: ['completed'],
  completed: [],
};

const LIMIT = 10;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const { data } = await getAllOrders(params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || data.totalPages || 1);
      setTotalOrders(data.pagination?.total ?? data.totalOrders ?? data.orders?.length ?? 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <FaFilter className="text-gray-600 text-sm mr-1" />
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
          <FaShoppingCart className="text-gray-700 text-5xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-600 text-sm mt-1">
            {statusFilter
              ? `No ${statusFilter} orders at the moment`
              : 'Orders will appear here when customers make purchases'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Package
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Qty
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Date
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order) => {
                  const available = statusOptions[order.status] || [];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-300 font-mono cursor-help"
                          title={order.id}
                        >
                          {order.id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-300">
                          {order.customerEmail}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white font-medium">
                          {order.package?.title || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {order.quantity ?? 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white font-semibold">
                          ${order.totalPrice?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[order.status] || statusColors.pending}`}
                        >
                          <FaClock className="text-[10px]" />
                          {order.status?.charAt(0).toUpperCase() +
                            order.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          {available.length > 0 ? (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusChange(order.id, e.target.value);
                                }
                              }}
                              disabled={updatingId === order.id}
                              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value="">Change status</option>
                              {available.map((s) => (
                                <option key={s} value={s}>
                                  Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gray-600 italic">
                              No actions
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
                <span className="text-gray-600 ml-2">
                  ({totalOrders} total order{totalOrders !== 1 ? 's' : ''})
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FaChevronLeft className="text-xs" />
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
