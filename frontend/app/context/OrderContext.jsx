// context/OrderContext.jsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import orderService from '../services/order';
import { useAuth } from './AuthContext';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch user orders
  const fetchUserOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.getUserOrders();
      let ordersArray = [];
      if (data && data.data && Array.isArray(data.data)) {
        ordersArray = data.data;
      } else if (data && Array.isArray(data)) {
        ordersArray = data;
      } else if (data && data.orders && Array.isArray(data.orders)) {
        ordersArray = data.orders;
      } else {
        ordersArray = [];
      }
      setOrders(ordersArray);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single order
  const fetchOrderById = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.getOrderById(orderId);
      let orderData = data;
      if (data && data.data) {
        orderData = data.data;
      }
      setCurrentOrder(orderData);
      return orderData;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newOrder = await orderService.createOrder(orderData);
      let order = newOrder;
      if (newOrder && newOrder.data) {
        order = newOrder.data;
      }
      setOrders(prevOrders => [order, ...prevOrders]);
      return order;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update order status (admin)
  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Updating order status in context:', { orderId, status });
      const updated = await orderService.updateOrderStatus(orderId, status);
      console.log('📦 Updated order from API:', updated);
      
      let order = updated;
      if (updated && updated.data) {
        order = updated.data;
      }
      
      setOrders(prevOrders => 
        prevOrders.map(o => o._id === orderId || o.id === orderId ? order : o)
      );
      
      if (currentOrder && (currentOrder._id === orderId || currentOrder.id === orderId)) {
        setCurrentOrder(order);
      }
      
      return order;
    } catch (err) {
      console.error('❌ Update order status error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update order status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const cancelled = await orderService.cancelOrder(orderId);
      let order = cancelled;
      if (cancelled && cancelled.data) {
        order = cancelled.data;
      }
      
      setOrders(prevOrders => 
        prevOrders.map(o => o._id === orderId || o.id === orderId ? order : o)
      );
      
      if (currentOrder && (currentOrder._id === orderId || currentOrder.id === orderId)) {
        setCurrentOrder(order);
      }
      
      return order;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Fetch all orders
  const fetchAllOrders = async () => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required');
      setOrders([]);
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.getAllOrders();
      let ordersArray = [];
      if (data && data.data && Array.isArray(data.data)) {
        ordersArray = data.data;
      } else if (data && Array.isArray(data)) {
        ordersArray = data;
      } else if (data && data.orders && Array.isArray(data.orders)) {
        ordersArray = data.orders;
      } else {
        ordersArray = [];
      }
      setOrders(ordersArray);
      return ordersArray;
    } catch (err) {
      let errorMessage = 'Failed to fetch orders';
      if (err.response?.status === 403) {
        errorMessage = 'Admin access required';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setOrders([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchUserOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const value = {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    fetchOrderById,
    updateOrderStatus,
    cancelOrder,
    fetchAllOrders,
    fetchUserOrders,
    setOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};