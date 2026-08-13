// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../Models/Order'); // Adjust the path to your Order model

// POST /api/payment/esewa/create
router.post('/esewa/create', async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ 
                message: 'Order ID is required' 
            });
        }

        // Fetch order from your database
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'paid' || order.paymentStatus === 'completed') {
            return res.status(400).json({ 
                message: 'Order has already been paid' 
            });
        }
        
        // Generate transaction UUID
        const transaction_uuid = `txn-${Date.now()}-${orderId}`;
        
        // eSewa configuration
        const product_code = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
        const secret_key = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
        
        // Use actual order amounts from database
        const total_amount = order.totalAmount.toFixed(2);
        const tax_amount = (order.tax || 0).toFixed(2);
        const product_service_charge = (order.serviceCharge || 0).toFixed(2);
        const product_delivery_charge = (order.deliveryCharge || 0).toFixed(2);
        const amount = (order.totalAmount - (order.tax || 0) - (order.serviceCharge || 0) - (order.deliveryCharge || 0)).toFixed(2);

        // Create signature string
        const signed_field_names = "total_amount,transaction_uuid,product_code";
        const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        
        // Generate signature
        const signature = crypto
            .createHmac('sha256', secret_key)
            .update(signatureString)
            .digest('base64');

        // Prepare payment data for eSewa
        const paymentData = {
            amount,
            tax_amount,
            total_amount,
            transaction_uuid,
            product_code,
            product_service_charge,
            product_delivery_charge,
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}&transaction_uuid=${transaction_uuid}`,
            failure_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure?orderId=${orderId}`,
            signed_field_names,
            signature,
        };

        // Save transaction to database
        order.paymentDetails = {
            transaction_uuid,
            paymentMethod: 'esewa',
            amount: total_amount,
            status: 'pending',
            initiatedAt: new Date()
        };
        await order.save();

        console.log('eSewa payment data generated:', paymentData);
        console.log(' Order details:', {
            orderId: order._id,
            totalAmount: total_amount,
            customer: order.shippingAddress?.email || 'N/A'
        });
        
        res.json(paymentData);

    } catch (error) {
        console.error(' eSewa payment error:', error);
        res.status(500).json({ 
            message: 'Payment initialization failed', 
            error: error.message 
        });
    }
});

// POST /api/payment/esewa/verify
router.post('/esewa/verify', async (req, res) => {
    try {
        const { transaction_uuid, orderId, status, refId } = req.body;

        console.log('Verifying payment:', { transaction_uuid, orderId, status, refId });

        if (!orderId || !transaction_uuid) {
            return res.status(400).json({ 
                message: 'Order ID and Transaction UUID are required' 
            });
        }

        // Find the order
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }

        if (status === 'success') {
            // Update order status
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            order.paymentDetails = {
                ...order.paymentDetails,
                status: 'completed',
                verifiedAt: new Date(),
                refId: refId || transaction_uuid
            };
            await order.save();

            console.log(' Payment verified and order updated:', orderId);
            
            res.json({ 
                success: true, 
                message: 'Payment verified successfully',
                order: {
                    id: order._id,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    totalAmount: order.totalAmount
                }
            });
        } else {
            // Payment failed
            order.paymentStatus = 'failed';
            order.paymentDetails = {
                ...order.paymentDetails,
                status: 'failed',
                failedAt: new Date()
            };
            await order.save();

            console.log(' Payment failed for order:', orderId);
            
            res.json({ 
                success: false, 
                message: 'Payment verification failed' 
            });
        }

    } catch (error) {
        console.error(' Payment verification error:', error);
        res.status(500).json({ 
            message: 'Payment verification failed', 
            error: error.message 
        });
    }
});

// GET /api/payment/esewa/status/:orderId (Optional - Check payment status)
router.get('/esewa/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).select('paymentStatus paymentDetails status totalAmount');

        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }

        res.json({
            orderId: order._id,
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            paymentDetails: order.paymentDetails
        });

    } catch (error) {
        console.error(' Payment status check error:', error);
        res.status(500).json({ 
            message: 'Failed to check payment status', 
            error: error.message 
        });
    }
});

module.exports = router;