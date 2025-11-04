// src/components/PayBills.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import billService from '../services/billService'; // <--- NEW IMPORT
import './PayBills.css'; // You'll create this CSS file

const MOCK_SIGNATURE = "mock_valid_signature_12345"; // Must match backend MockPaymentGatewayImpl!

const PayBills = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [token, setToken] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            navigate('/login');
            return;
        }
        setToken(user.token);
        fetchBills(user.token);
    }, [navigate]);

    const fetchBills = async (authToken) => {
        setIsLoading(true);
        // NOTE: You need a Bill-specific endpoint, 
        // but for now, we'll assume dashboardService can fetch the bills list.
        // A dedicated endpoint like /api/bills/unpaid is recommended.
        try {
            // For now, let's assume dashboardService has a method to fetch all customer bills
            const response = await billService.getCurrentBills(authToken); 
            // Filter only unpaid bills that are linked to a dunning event
            setBills(response.filter(bill => (bill.status  && bill.status.toUpperCase()!=='PAID') && (bill.dunningEventId && bill.dunningEventId > 0) )); 
        } catch (error) {
            setMessage('Failed to load bills.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- MOCK PAYMENT LOGIC ---
    const handleMockPayment = async (bill) => {
        if (!token) return;

        setMessage(`Processing payment for Bill ID ${bill.billId}...`);
        
        try {
            // Step 1: Get Order ID from the backend Mock Service
            const orderResponse = await paymentService.createOrder(
                bill.billId, 
                bill.amount, 
                token
            );

            // --- SIMULATED RAZORPAY POPUP SUCCESS ---
            // We immediately jump to success, simulating the user completing the transaction.
            const simulatedPaymentId = "pay_" + Math.random().toString(36).substring(2, 15);

            const verificationData = {
                billId: bill.billId,
                razorpayOrderId: orderResponse.orderId,
                razorpayPaymentId: simulatedPaymentId,
                razorpaySignature: MOCK_SIGNATURE, // The valid signature
            };

            // Step 2: Send verification and trigger Curing logic in backend
            const verifyResponse = await paymentService.verifyPayment(verificationData, token);

            setMessage(`Payment successful for Bill ID ${bill.billId}. Bill cured and service restored.`);
            
            // Refresh the bills list after a small delay
            setTimeout(() => {
                fetchBills(token);
            }, 2000);

        } catch (error) {
            console.error('Payment failed:', error);
            setMessage(`Payment failed for Bill ID ${bill.billId}. Details: ${error.response?.data || error.message}`);
        }
    };
    
    if (isLoading) return <div className="loading">Loading bills...</div>;

    return (
        <div className="paybills-container">
            <div className="paybills-wrapper">
                <h1>Pay Pending Bills</h1>
                <p>Select a bill below to initiate the mock payment and restore your service.</p>

                {message && <div className="status-message">{message}</div>}

                {bills.length === 0 ? (
                    <div className="no-bills">
                        <p>No pending bills linked to a dunning event found.</p>
                        <button onClick={() => navigate('/dashboard')} className="back-btn">Back to Dashboard</button>
                    </div>
                ) : (
                    <div className="bill-list">
                        {bills.map(bill => (
                            <div key={bill.billId} className="bill-item">
                                <div className="bill-details">
                                    <h3>{bill.serviceName} Bill ({bill.billId})</h3>
                                    <p>Description: {bill.description}</p>
                                    <p>Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                                    <p className="bill-amount">Amount Due: **{bill.amount}**</p>
                                </div>
                                <button 
                                    className="pay-btn" 
                                    onClick={() => handleMockPayment(bill)}
                                >
                                    Mock Pay Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayBills;