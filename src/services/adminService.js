import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

// --- Axios Instance with Interceptor ---
// (We should use the interceptor you had before for token management)
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('admin_token_cc');
    if (token && config.url !== '/login') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- Admin API Service ---
const adminService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            if (response.data.token) {
                localStorage.setItem('admin_token_cc', response.data.token); // Store the token
                return { token: response.data.token }; // Return the token (to be used in the frontend)
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    getAllCustomers: async () => {
        const response = await axiosInstance.get('/customers/all');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    },

    getDashboard: () => axiosInstance.get('/dashboard').then(res => res.data),
    // ✅ NEW: getFilteredCustomers
    getFilteredCustomers: async (customerId, phoneNumber) => {
        try {
            const paramsObj = {};

            // 1. Handle customerId
            if (customerId && String(customerId).trim() !== '') {
                paramsObj.customerId = customerId.trim();
            }

            // 2. Handle phoneNumber
            if (phoneNumber && phoneNumber.trim() !== '') {
                paramsObj.phoneNumber = phoneNumber.trim();
            }

            const response = await axiosInstance.get('/customers', { params: paramsObj });

            const data = response.data;

            // **THE FIX IS HERE:**
            // This makes the service robust. It checks if the response is an array directly.
            // If not, it looks for a `content` or `customers` property, which is common
            // in paginated or structured backend responses.
            if (Array.isArray(data)) {
                return data;
            }
            if (data && Array.isArray(data.content)) {
                return data.content;
            }
            if (data && Array.isArray(data.customers)) {
                return data.customers;
            }

        } catch (error) {
            console.error('Error fetching filtered customers:', error);
            // This is likely where your 401/403 errors are being caught if your AdminRoute/Interceptor isn't working perfectly.
            throw error;
        }
    },

    getCustomerById: async (customerId) => {
        const token = localStorage.getItem('admin_token_cc');
        const response = await axios.get(`${API_URL}/customers/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Add this new method for creating a customer
    createCustomer: (customerData) => axiosInstance.post('/customers', customerData).then(res => res.data),

    // --- Dunning Rules Management ---
    getAllRules: () => axiosInstance.get('/rules').then(res => res.data),
    createRule: (ruleData) => axiosInstance.post('/rules', ruleData).then(res => res.data),
    updateRule: (id, ruleData) => axiosInstance.put(`/rules/${id}`, ruleData).then(res => res.data),
    deleteRule: (id) => axiosInstance.delete(`/rules/${id}`),

    // --- Dunning Events Management ---
    getAllEvents: (filters) => {
        // filters is an object like { status: 'PENDING', planType: 'POSTPAID', serviceName: 'Broadband' }
        return axiosInstance.get('/events', { params: filters }).then(res => res.data);
    },

    // Subscription Management
    updateSubscription: async (subscriptionId, updates) => {
        const token = localStorage.getItem('admin_token_cc');
        const response = await axios.put(
            `${API_URL}/subscriptions/${subscriptionId}`,
            updates,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    },

    // Customer Management
    updateServiceStatus: async (customerId, serviceName, newStatus) => {
        const token = localStorage.getItem('admin_token_cc');
        const response = await axios.put(
            `${API_URL}/customers/${customerId}/services/${encodeURIComponent(serviceName)}/status`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },
};

export default adminService;