module.exports = {
    productCode: process.env.ESEWA_PRODUCT_CODE,
    secretKey: process.env.ESEWA_SECRET_KEY,

    paymentUrl:
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form",

    verifyUrl:
        "https://rc.esewa.com.np/api/epay/transaction/status/"
};