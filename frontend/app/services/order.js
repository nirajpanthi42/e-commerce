// services/order.js
import api from './api';

export const orderService = {
  // Get all orders (admin only)
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders/user');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId, status) => {
    try {
      console.log('📤 Updating order status:', { orderId, status });
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      console.log('✅ Order status updated:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Update order status error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  // Debug: Test authentication
  testAuth: async () => {
    try {
      const response = await api.get('/orders/auth');
      return response.data;
    } catch (error) {
      console.error('Test auth error:', error);
      throw error;
    }
  },

  // Debug: Test admin access
  testAdmin: async () => {
    try {
      const response = await api.get('/orders/admin');
      return response.data;
    } catch (error) {
      console.error('Test admin error:', error);
      throw error;
    }
  }
};

export default orderService;