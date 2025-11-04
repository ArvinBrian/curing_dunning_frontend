// src/services/authService.js (FIXED)

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const authService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });

            console.log('Login response:', response.data);

            if (response.data.token) {
                // **THE FIX IS HERE**
                // 1. Create the object the dashboard expects
                const user = {
                    token: response.data.token,
                    email: email // Add email so "Welcome, {name}" works
                };

                // 2. Store this object as a JSON string under the key 'user'
                localStorage.setItem('user', JSON.stringify(user));

                // 3. Return the user object (or response.data)
                return user;
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: () => {
        // **FIX LOGOUT**
        // Make sure logout removes the correct item
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        // **FIX GETCURRENTUSER** (to be consistent)
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default authService;