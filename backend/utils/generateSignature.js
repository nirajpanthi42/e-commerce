const crypto = require("crypto");

const generateSignature = (message, secret) => {
    return crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("base64");
};

module.exports = generateSignature;