// src/components/Login.js (COMPLETE FILE)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css'; // Make sure this CSS file exists

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- THIS IS THE NEW, CORRECTED LOGIC ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            // authService.login now handles localStorage automatically
            await authService.login(email, password);

            // If it succeeds, navigate.
            navigate('/dashboard');

        } catch (err) {
            console.error('Login component error:', err);
            setError('Invalid email or password'); // Show user-friendly error
        }
    };
    // --- END OF NEW LOGIC ---

    // --- THIS IS YOUR ORIGINAL JSX, NOW RESTORED ---
    return (
        <div className="login-container">
            <div className="left-panel">
                <div className="login-wrapper">
                    <div className="logo">CONNECTCOM</div>
                    <div className="login-form">
                        <h1>Welcome Back</h1>
                        <p>Please enter your details to sign in</p>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                .                     <label>Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    s required
                                />
                            </div>
                            s           <button type="submit" className="login-btn">
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="right-panel">
                <div className="content">
                    <h2>Welcome to CONNECTCOM</h2>
                    <p>Your trusted telecommunications partner</p>
                    <div className="animation-container">
                        <div className="circle c1"></div>
                        <div className="circle c2"></div>
                        <div className="circle c3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;