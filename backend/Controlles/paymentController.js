const Order = require("../Models/Order");
const EsewaService = require("../Services/esewaService");

exports.createPayment = async (req, res) => {

    try {

        const { orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const payment =
            EsewaService.createPayment(order);

        res.json(payment);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.verifyPayment = async (req, res) => {

    try {

        const {
            product_code,
            total_amount,
            transaction_uuid
        } = req.query;

        const result =
            await EsewaService.verifyPayment(
                product_code,
                total_amount,
                transaction_uuid
            );

        if (result.status === "COMPLETE") {

            await Order.findByIdAndUpdate(
                transaction_uuid,
                {
                    paymentStatus: "Paid"
                }
            );

            return res.json({
                success: true,
                payment: result
            });
        }

        return res.status(400).json({
            success: false
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};