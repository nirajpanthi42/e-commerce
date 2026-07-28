const axios = require("axios");
const esewa = require("../Config/esewa");
const generateSignature = require("../utils/generateSignature");

class EsewaService {

    createPayment(order) {

        const message =
            `total_amount=${order.total}` +
            `,transaction_uuid=${order._id}` +
            `,product_code=${esewa.productCode}`;

        const signature = generateSignature(
            message,
            esewa.secretKey
        );

        return {

            amount: order.total,

            tax_amount: 0,

            total_amount: order.total,

            transaction_uuid: order._id.toString(),

            product_code: esewa.productCode,

            product_service_charge: 0,

            product_delivery_charge: 0,

            success_url: process.env.ESEWA_SUCCESS_URL,

            failure_url: process.env.ESEWA_FAILURE_URL,

            signed_field_names:
                "total_amount,transaction_uuid,product_code",

            signature
        };
    }

    async verifyPayment(
        productCode,
        totalAmount,
        transactionUuid
    ) {

        const response = await axios.get(
            esewa.verifyUrl,
            {
                params: {
                    product_code: productCode,
                    total_amount: totalAmount,
                    transaction_uuid: transactionUuid
                }
            }
        );

        return response.data;
    }

}

module.exports = new EsewaService();