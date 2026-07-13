// app/admin/orders/page.jsx
'use client';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiRefreshCw, 
  FiPackage, 
  FiDollarSign, 
  FiClock, 
  FiCalendar,
  FiSearch,
  FiFilter,
  FiUsers,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrdersPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const { orders, loading, fetchAllOrders, updateOrderStatus } = useOrder();
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin) {
      router.push('/');
      return;
    }
    
    loadOrders();
  }, [isAuthenticated, isAdmin]);

  const loadOrders = async () => {
    try {
      setError(null);
      await fetchAllOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    setUpdateSuccess(null);
    setError(null);
    
    try {
      await updateOrderStatus(orderId, newStatus);
      setUpdateSuccess(`Order ${orderId.slice(-6)} updated to ${newStatus}`);
      setTimeout(() => loadOrders(), 500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock, label: 'Pending' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiRefreshCw, label: 'Processing' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: FiTruck, label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'Cancelled' }
    };
    
    const statusConfig = config[status?.toLowerCase()] || config.pending;
    const Icon = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold  text-black ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error && !updating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={loadOrders}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const ordersList = Array.isArray(orders) ? orders : [];
  
  const filteredOrders = ordersList.filter(order => {
    const search = searchTerm.toLowerCase();
    const orderId = (order._id || order.id || '').toLowerCase();
    const customerName = (order.userId?.name || order.user?.name || '').toLowerCase();
    const customerEmail = (order.userId?.email || order.user?.email || '').toLowerCase();
    const status = (order.status || '').toLowerCase();
    
    const matchesSearch = orderId.includes(search) || 
                          customerName.includes(search) || 
                          customerEmail.includes(search);
    const matchesFilter = filterStatus === 'all' || status === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const totalOrders = ordersList.length;
  const pendingOrders = ordersList.filter(o => o.status === 'pending').length;
  const totalRevenue = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Orders Management
              </h1>
              <p className="text-gray-500 mt-1">Manage all orders from your customers</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={loadOrders}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02]"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition"
              >
                <FiArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Unique Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(ordersList.map(o => o.userId?._id || o.user?._id)).size}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {updateSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-2xl mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FiCheckCircle className="w-5 h-5" />
                {updateSuccess}
              </div>
              <button 
                onClick={() => setUpdateSuccess(null)}
                className="text-green-700 hover:text-green-900"
              >
                <FiXCircle className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <FiFilter className="text-gray-400 flex-shrink-0" />
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No orders match your filters' : 'No Orders Found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'There are no orders in the system yet.'}
              </p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order, index) => {
                      const orderId = order._id || order.id;
                      const orderStatus = order.status || 'pending';
                      const orderTotal = order.totalAmount || 0;
                      const orderItems = order.items || [];
                      const orderDate = order.createdAt || order.orderDate || new Date();
                      const customerName = order.userId?.name || order.user?.name || 'N/A';
                      const customerEmail = order.userId?.email || order.user?.email || '';
                      
                      return (
                        <motion.tr 
                          key={orderId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            #{orderId?.slice(-8) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{customerName}</div>
                            {customerEmail && (
                              <div className="text-xs text-gray-500">{customerEmail}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ${orderTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                              {orderItems.length}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(orderStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3 text-gray-400" />
                              {new Date(orderDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <select
                                value={orderStatus}
                                onChange={(e) => handleStatusUpdate(orderId, e.target.value)}
                                disabled={updating === orderId}
                                className={`border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                  updating === orderId ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {statusOptions.filter(s => s !== 'all').map((status) => (
                                  <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </option>
                                ))}
                              </select>
                              {updating === orderId && (
                                <span className="text-xs text-blue-500 animate-pulse">Updating...</span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}