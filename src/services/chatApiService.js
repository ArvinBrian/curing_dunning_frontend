// New file: src/services/chatApiService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const chatApiService = {
    // Get customer account details
    getCustomerInfo: async (token) => {
        const response = await axios.get(`${API_URL}/customer/info`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Get billing status including dunning events
    getBillingStatus: async (token) => {
        const response = await axios.get(`${API_URL}/billing/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Get service status (internet/mobile)
    getServiceStatus: async (token) => {
        const response = await axios.get(`${API_URL}/services/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Request payment arrangement
    requestPaymentArrangement: async (token, billId, installments) => {
        const response = await axios.post(`${API_URL}/billing/arrangement`, {
            billId,
            installments
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Run service diagnostics
    runDiagnostics: async (token, serviceId, diagnosticType) => {
        const response = await axios.post(`${API_URL}/services/diagnose`, {
            serviceId,
            diagnosticType
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default chatApiService;