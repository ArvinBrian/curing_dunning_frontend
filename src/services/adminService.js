import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

// --- Axios Instance with Interceptor ---
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('admin_token_cc');
    // Ensure we don't send a token for the login endpoint
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
                return { token: response.data.token }; 
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // ⚠️ Deprecated. We're using getFilteredCustomers for everything now.
    // If you remove this, ensure you also remove it from AdminDashboard.jsx initial fetch!
    // getAllCustomers: async () => {
    //     const response = await axiosInstance.get('/customers/all');
    //     if (Array.isArray(response.data)) {
    //         return response.data;
    //     }
    //     return [];
    // },

    getDashboard: () => axiosInstance.get('/dashboard').then(res => res.data),

    // ✅ REFINED: getFilteredCustomers
    // This is the correct function to use for both initial load (empty filters) and filtering.
    getFilteredCustomers: async (customerId, phoneNumber) => {
        try {
            const paramsObj = {};

            // 1. Handle customerId: Only add if it's a non-empty string/value
            // Spring requires 'customerId' to be a Long, so we avoid sending empty strings
            // and rely on the debounced value from the frontend.
            if (customerId && String(customerId).trim() !== '') {
                // IMPORTANT: We send it as a string. Spring converts it to Long.
                paramsObj.customerId = customerId.trim(); 
            }

            // 2. Handle phoneNumber: Only add if it's a non-empty string
            if (phoneNumber && String(phoneNumber).trim() !== '') {
                paramsObj.phoneNumber = phoneNumber.trim();
            }
            
            // If paramsObj is empty, axios sends no query params, which triggers 
            // the backend AdminService to return all customers. (This is the FIX!)
            const response = await axiosInstance.get('/customers', { params: paramsObj });

            const data = response.data;

            // Return the data directly, assuming the backend always returns an array of customers.
            if (Array.isArray(data)) {
                return data;
            }
            
            // Fallback for structured responses (like pagination objects) - removed for simplicity
            // if (data && Array.isArray(data.content)) { return data.content; }
            // if (data && Array.isArray(data.customers)) { return data.customers; }
            
            return []; // Return an empty array if the response is unexpected

        } catch (error) {
            // Handle errors, especially 401/403 for unauthorized access
            console.error('Error fetching filtered customers:', error);
            throw error;
        }
    },

    getCustomerById: (customerId) => {
        // Using axiosInstance means we don't need to manually pass the token header
        return axiosInstance.get(`/customers/${customerId}`).then(res => res.data);
    },

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
    updateSubscription: (subscriptionId, updates) => {
        return axiosInstance.put(`/subscriptions/${subscriptionId}`, updates).then(res => res.data);
    },

    // Customer Management
    updateServiceStatus: (customerId, serviceName, newStatus) => {
        return axiosInstance.put(
            // Use encodeURIComponent to safely handle service names with special characters
            `/customers/${customerId}/services/${encodeURIComponent(serviceName)}/status`,
            { status: newStatus }
        ).then(res => res.data);
    },
};

export default adminService;