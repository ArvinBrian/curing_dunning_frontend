// src/services/dashboardService.js (FIXED)

import axios from 'axios';

// Base URL must match your @RequestMapping("/dashboard")
const API_URL = 'http://localhost:8080/dashboard'; 

const getCustomerDashboard = async (token) => { // Removed email parameter
    const response = await axios.get(API_URL, { // Calling /dashboard directly
        headers: {
            // Spring Security uses this token to find the user (email)
            Authorization: `Bearer ${token}` 
        }
    });
    return response.data;
};

const dashboardService = {
    getCustomerDashboard,
};

export default dashboardService;