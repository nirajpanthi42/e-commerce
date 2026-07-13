// app/orders/[id]/page.jsx
'use client';
import { useOrder } from '../../context/OrderContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag
} from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentOrder, loading, fetchOrderById, cancelOrder } = useOrder();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrder(id);
      setShowCancelModal(false);
      router.push('/orders');
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        label: 'Pending',
        description: 'Your order is being processed'
      },
      processing: {
        icon: Package,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        label: 'Processing',
        description: 'We are preparing your order'
      },
      shipped: {
        icon: Truck,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        label: 'Shipped',
        description: 'Your order is on the way'
      },
      delivered: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        label: 'Delivered',
        description: 'Your order has been delivered'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: 'Cancelled',
        description: 'This order has been cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    return steps.map((step, index) => ({
      ...getStatusConfig(step),
      status: step,
      isComplete: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  if (loading) return <Loader />;
  if (!currentOrder) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or has been removed.</p>
        <Link href="/orders" className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </Link>
      </div>
    </div>
  );

  const statusConfig = getStatusConfig(currentOrder.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href="/orders" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Order #{currentOrder.id}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                  <span className="inline-flex items-center gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </span>
              </div>
              <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-sm text-gray-500 flex flex-col items-start sm:items-end">
              <span className="font-medium text-gray-700">Order Status</span>
              <span className="text-gray-500">{statusConfig.description}</span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Order Progress
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {getStatusSteps(currentOrder.status).map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${step.isComplete ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {step.isComplete ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <StepIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className={`font-medium ${step.isComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </div>
                      {step.isCurrent && (
                        <div className="text-sm text-blue-600 mt-1 font-medium">
                          Current Status
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-4">
                {currentOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    {item.product?.image && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.product.image} 
                          alt={item.name || item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name || item.product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">${currentOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">${currentOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              {currentOrder.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Orders can only be cancelled while in pending status
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Order?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}