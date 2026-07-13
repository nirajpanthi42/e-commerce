// backend/Controllers/orderController.js
const Order = require('../Models/Order');


exports.getAllOrders = async (req, res) => {
  try {
   
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

//    Get user's orders
//    GET /api/orders/user
//   Private
exports.getUserOrders = async (req, res) => {
  try {
    
    const orders = await Order.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};


exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, subtotal, shipping, tax, discount, couponCode } = req.body;
    
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    const order = await Order.create({
      userId: req.user._id,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name || 'Product',
        image: item.image || ''
      })),
      totalAmount: totalAmount || subtotal,
      subtotal: subtotal || totalAmount,
      shipping: shipping || 0,
      tax: tax || 0,
      discount: discount || 0,
      couponCode: couponCode || null,
      status: 'pending',
      orderDate: new Date()
    });


    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};



exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const normalizedStatus = status.toLowerCase();
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Find and update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update status
    order.status = normalizedStatus;
    await order.save();
    
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};


exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order or is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is ${order.status}`
      });
    }
    
    // Cancel order
    order.status = 'cancelled';
    await order.save();
    
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(' cancelOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};