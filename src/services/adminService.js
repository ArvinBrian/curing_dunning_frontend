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
        // Login doesn't use the interceptor for tokens
        const response = await axios.post(`${API_URL}/login`, { email, password });
        if (response.data.token) {
            localStorage.setItem('admin_token_cc', response.data.token);
        }
        return response.data;
    },

    getDashboard: () => axiosInstance.get('/dashboard').then(res => res.data),

    // --- CUSTOMER MANAGEMENT ---
    
    // 🛑 REMOVED: getAllCustomers()
    
    // ✅ NEW: getFilteredCustomers
    // This function now calls your new backend endpoint
    getFilteredCustomers: async (customerId, phoneNumber) => {
        try {
            // build plain params object (axios will serialize)
            const paramsObj = {};
            if (customerId !== undefined && customerId !== null && customerId !== '') paramsObj.customerId = customerId;
            if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== '') paramsObj.phoneNumber = phoneNumber;

            const response = await axiosInstance.get('/customers', { params: paramsObj });
            console.log('Raw customers API response:', response); // full response for debugging

            let data = response.data;

            // Helper: extract first balanced JSON array from a string
            function extractFirstJsonArray(str) {
                if (typeof str !== 'string') return null;
                const start = str.indexOf('[');
                if (start === -1) return null;
                let depth = 0;
                for (let i = start; i < str.length; i++) {
                    if (str[i] === '[') depth++;
                    else if (str[i] === ']') {
                        depth--;
                        if (depth === 0) {
                            return str.slice(start, i + 1);
                        }
                    }
                }
                return null;
            }

            // If backend returned a JSON string, try to parse it
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                    console.log('Parsed customers JSON string ->', data);
                } catch (parseErr) {
                    console.warn('Failed to JSON.parse customers response string:', parseErr);
                    // Try to extract a balanced array substring and parse that
                    const arrText = extractFirstJsonArray(response.data);
                    if (arrText) {
                        try {
                            data = JSON.parse(arrText);
                            console.log('Recovered JSON array from response string (balanced parser)');
                        } catch (recoverErr) {
                            console.error('Could not parse recovered JSON array:', recoverErr);
                            data = null;
                        }
                    } else {
                        data = null;
                    }
                }
            }

            // Normalize common wrapper shapes
            if (Array.isArray(data)) return data;
            if (data == null) return [];
            if (Array.isArray(data.content)) return data.content;
            if (Array.isArray(data.data)) return data.data;
            if (Array.isArray(data.customers)) return data.customers;

            // Try to discover an array property
            for (const key of Object.keys(data)) {
                if (Array.isArray(data[key])) return data[key];
            }

            // Fallback: return empty list
            return [];
        } catch (error) {
            console.error('Error fetching customers:', error);
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


    // --- Dunning Rules Management ---
    getAllRules: () => axiosInstance.get('/rules').then(res => res.data),
    createRule: (ruleData) => axiosInstance.post('/rules', ruleData).then(res => res.data),
    updateRule: (id, ruleData) => axiosInstance.put(`/rules/${id}`, ruleData).then(res => res.data),
    deleteRule: (id) => axiosInstance.delete(`/rules/${id}`),

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