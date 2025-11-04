// src/services/billService.js

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/bills';

const getCurrentBills = async (token) => {
    const response = await axios.get(`${API_URL}/current`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    // This endpoint correctly returns List<BillDTO> for the logged-in user
    return response.data; 
};

const getPastBills = async (token) => {
    const response = await axios.get(`${API_URL}/past`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data; // List of past (PAID) bills
};

const billService = {
    getCurrentBills,
    getPastBills,
};

export default billService;