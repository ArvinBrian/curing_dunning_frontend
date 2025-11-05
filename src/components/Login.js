import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login component error:', err);
            setError('Invalid email or password');
        }
    };

    return (
        <div className="login-container">
            <div className="left-panel">
                <div className="login-wrapper">
                    <div className="logo">ConnectCom</div>

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
                                <label>Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn">
                                Sign In
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Copyright © 2025 CONNECTCOM LTD.</p>
                            <a href="#">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="content">
                    <h2 className="hero-title">
                        Bridging the gap between <span className="highlight">Connection</span> and <span className="highlight">Communication</span>
                    </h2>
                    <p className="hero-subtext">All your services. At one place</p>

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
