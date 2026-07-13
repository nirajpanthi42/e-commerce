// app/orders/page.jsx
'use client';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useEffect } from 'react';
import Loader from '../components/Loader';
import { FiPackage, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';
import Navbar from '../components/Navbar';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { orders, loading, fetchUserOrders } = useOrder();

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
          <Link 
            href="/login" 
            className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">View all your order history</p>
        </div>

        {ordersList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link 
              href="/" 
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersList.map((order) => {
              const orderId = order._id || order.id;
              const orderStatus = order.status || 'pending';
              const orderTotal = order.totalAmount || 0;
              const orderItems = order.items || [];
              const orderDate = order.createdAt || order.orderDate || new Date();
              
              const getStatusBadge = (status) => {
                const colors = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  processing: 'bg-blue-100 text-blue-800',
                  shipped: 'bg-purple-100 text-purple-800',
                  delivered: 'bg-green-100 text-green-800',
                  cancelled: 'bg-red-100 text-red-800'
                };
                return `px-3 py-1 inline-flex text-xs font-semibold rounded-full ${colors[status] || colors.pending}`;
              };

              return (
                <div key={orderId} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Order #{orderId?.slice(-6) || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(orderDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={getStatusBadge(orderStatus)}>
                        {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${orderTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Items: {orderItems.length}
                    </p>
                    <Link 
                      href={`/orders/${orderId}`}
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}