import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billService from '../services/billService';
import { FaHistory, FaArrowLeft } from 'react-icons/fa';
import './PaymentHistory.css'; // You'll need to create this CSS file

const PaymentHistory = () => {
    const navigate = useNavigate();
    const [pastBills, setPastBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                navigate('/login');
                return;
            }

            try {
                const data = await billService.getPastBills(user.token);
                // Filter to ensure only PAID bills are shown, just in case
                setPastBills(data.filter(bill => bill.status === 'PAID'));
            } catch (err) {
                console.error('Failed to load payment history:', err);
                setError('Failed to load payment history. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    if (isLoading) return <div className="payment-history-container"><p>Loading payment history...</p></div>;
    if (error) return <div className="payment-history-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="payment-history-container">
            <header className="history-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn"><FaArrowLeft /> Back to Dashboard</button>
                <h1><FaHistory /> Payment History</h1>
            </header>

            <div className="history-content">
                {pastBills.length === 0 ? (
                    <p>No past payment records found.</p>
                ) : (
                    <div className="past-bill-list">
                        {pastBills
                            .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)) // Sort by newest payment date first
                            .map(bill => (
                                <div key={bill.billId} className="past-bill-item">
                                    <div className="item-details">
                                        <h3>{bill.serviceName} Bill #{bill.billId}</h3>
                                        <p>Original Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="item-payment-info">
                                        <p className="paid-amount">Paid: **${bill.amount}**</p>
                                        <p className="paid-date">
                                            Paid on: 
                                            {bill.paymentDate 
                                                ? new Date(bill.paymentDate).toLocaleDateString() // ⭐ THE FIX IS HERE ⭐
                                                : new Date(bill.createdAt).toLocaleDateString()} 
                                        </p>                                    
                                        </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;