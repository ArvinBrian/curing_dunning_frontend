// File: src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    // File: src/pages/AdminLogin.jsx

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            // adminService.login already sets the token in localStorage
            // and returns an object like { token: "..." }
            const response = await adminService.login(email, password);

            // **THE FIX IS HERE:**
            // We check for 'response.token', NOT 'response.data.token'
            if (response && response.token) {
                console.log("Login successful, token received:", response.token);

                // The service already set the token, so we just navigate
                navigate('/admin/dashboard');
            } else {
                // This case handles if the service returns nothing
                throw new Error("Token was not returned from login service");
            }

        } catch (err) {
            console.error('Login error:', err);

            // This now correctly reports errors from the server (like 401)
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password.');
            } else {
                setError('An error occurred during login. Please try again.');
            }
        }
    };


    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1 className="admin-header__title">CONNECTCOM</h1>
            </header>
            <div className="admin-form-container">
                <h2 className="admin-title">
                    Admin Portal
                </h2>
                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        required
                        className="admin-input"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        required
                        className="admin-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="admin-button"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
};


export default AdminLogin;