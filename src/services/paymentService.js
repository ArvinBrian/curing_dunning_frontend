// src/services/paymentService.js

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/payment';

// Step 1: Request an order ID from the backend (which uses the Mock Gateway)
const createOrder = async (billId, amount, token) => {
    const response = await axios.post(`${API_URL}/create-order`, {
        billId: billId,
        amount: amount,
        currency: 'INR' // Assuming INR as the currency for the mock
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data; // Contains orderId, keyId, billId, amount
};

// Step 2: Send the mock successful payment details back for verification and curing
const verifyPayment = async (verificationData, token) => {
    const response = await axios.post(`${API_URL}/verify-success`, verificationData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data; // Expected: "Payment successful and bill cured."
};

const paymentService = {
    createOrder,
    verifyPayment,
};

export default paymentService;