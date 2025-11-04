import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCreditCard, FaHeadset, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import authService from '../services/authService';
// Assuming you have dashboardService and billService imported
import dashboardService from '../services/dashboardService'; 
import billService from '../services/billService'; 
import './Dashboard.css';

// --- Custom Hook for Data Fetching ---
// This separates the complex data fetching and state management logic.
const useDashboardData = (navigate) => {
    const [customerData, setCustomerData] = useState(null);
    // const [pastBills, setPastBills] = useState([]); // NEW state for past bills
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const fetchData = useCallback(async (token) => {
        try {
            // 1. Fetch main dashboard data (Services, Dunning Events)
            const dashboardPromise = dashboardService.getCustomerDashboard(token);
            
            // 2. Fetch Past Bills (unpaid bills are handled by PayBills page)
            // const pastBillsPromise = billService.getPastBills(token); 

            const [dashboardData, pastBillsData] = await Promise.all([
                dashboardPromise 
            ]);

            setCustomerData(dashboardData);
            // setPastBills(pastBillsData.filter(bill => bill.status === 'PAID')); // Filter to ensure only PAID bills are shown
            setError(null);
        } catch (err) {
            console.error('Dashboard data fetch failed:', err);
            setError('Failed to load dashboard data. Please try logging in again.');
            // Optional: If error is 401/403, redirect to login
            // authService.logout(); 
            // navigate('/login');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.token) {
            navigate('/login');
            return;
        }
        setUser(userData);
        fetchData(userData.token);
    }, [navigate, fetchData]);

    return { customerData, /*pastBills,*/ isLoading, error, user };
};

// --- Helper Component for Service Card ---
const ServiceCard = ({ service }) => {
    const statusClass = service.currentStatus ? service.currentStatus.toLowerCase() : 'unknown';
    return (
        <div className="service-card">
            <h3>{service.serviceName}</h3>
            <p>Status: <span className={`status-box ${statusClass}`}>{service.currentStatus || 'N/A'}</span></p>
            <p>{service.statusText}</p>
            {service.pendingAction && (
                <p className="pending-action">Action Needed: {service.pendingAction.replace(/_/g, ' ')}</p>
            )}
        </div>
    );
};

// --- Helper Component for Dunning Event List ---
const DunningEventList = ({ events }) => {
    const filteredEvents = events
        .filter(event => event.status === 'PENDING' || event.status === 'RESOLVED')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filteredEvents.length === 0) {
        return <p>No recent dunning events found.</p>;
    }

    return (
        <div className="dunning-event-list">
            {filteredEvents.map((event) => (
                <div key={event.id} className={`dunning-event-item ${event.status.toLowerCase()}`}>
                    <p><strong>Service:</strong> {event.serviceName}</p>
                    <p><strong>Status:</strong> <span className={`status-box ${event.status.toLowerCase()}`}>{event.status}</span></p>
                    <p><strong>Days Overdue:</strong> {event.daysOverdue}</p>
                    <p><strong>Triggered:</strong> {new Date(event.createdAt).toLocaleDateString()}</p>
                    
                    {event.status === 'PENDING' && event.pendingAction && (
                        <p className="event-action">Recommended Action: {event.pendingAction.replace(/_/g, ' ')}</p>
                    )}
                    {/* 💡 FIX HERE: Only display if status is RESOLVED AND resolvedAt is not null */}
                    {event.status === 'RESOLVED' && event.resolvedAt && (
                        <p className="event-resolved-at">Resolved: {new Date(event.resolvedAt).toLocaleDateString()}</p>
                    )}
                    {/* Add an else condition for PENDING events that need resolution info */}
                    {event.status === 'PENDING' && (
                        <p className="event-resolved-at">Resolution Required</p>
                    )}
                </div>
            ))}
        </div>
    );
};


const Dashboard = () => {
    const navigate = useNavigate();
    const { customerData, pastBills, isLoading, error, user } = useDashboardData(navigate);
    
    // Check if user is null before accessing properties to prevent crash on slow load/redirect
    const welcomeName = user && user.email ? user.email.split('@')[0] : 'Customer';

    const handleLogout = () => {
        authService.logout(); 
        navigate('/login'); 
    };

    // --- Loading and Error States ---
    if (isLoading) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error || !customerData) {
        return (
            <div className="dashboard-container">
                <div className="error-message">{error || 'No dashboard data available.'}</div>
                <button onClick={() => navigate('/login')} className="primary-btn">Go to Login</button>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="dashboard-layout">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-logo">CONNECOM</div>
                <ul className="navbar-links">
                    <li><button onClick={() => navigate('/dashboard')} className="nav-btn"><FaHome /> Home</button></li>
                    <li><button onClick={() => navigate('/pay-bills')} className="nav-btn"><FaCreditCard /> Pay Bills</button></li>
                    <li><button onClick={() => navigate('/payment-history')} className="nav-btn"><FaHistory /> Payment History</button></li>
                    <li><button onClick={() => navigate('/support')} className="nav-btn"><FaHeadset /> Support</button></li>
                    <li><button onClick={handleLogout} className="nav-btn logout-btn"><FaSignOutAlt /> Log Out</button></li>
                </ul>
            </nav>

            <div className="dashboard-content-wrapper">
                <div className="dashboard-header">
                    <h1>Welcome, {welcomeName}!</h1> 
                    <p>Here's an overview of your services and billing history.</p>
                </div>

                {/* Service Cards Section */}
                <section className="services-section">
                    <h2>Your Services</h2>
                    <div className="service-cards-container">
                        {customerData.services && customerData.services.length > 0 ? (
                            customerData.services.map((service, index) => (
                                <ServiceCard key={index} service={service} />
                            ))
                        ) : (
                            <p>No active services found.</p>
                        )}
                    </div>
                </section>

                <hr />

                {/* Dunning Events Section (RESTORED) */}
                <section className="dunning-events-section">
                    <h2>⚠️ Your Dunning Events</h2>
                    
                    {/* Call the helper component, passing the events array from customerData */}
                    <DunningEventList events={customerData.events || []} /> 
                    
                </section>

                {/* Billing History Section (Combined Dunning Events and Past Bills) */}
                

                {/* Footer */}
                <footer className="dashboard-footer">
                    <span>Copyright © 2025 CONNECOM LTD.</span>
                    <span>Privacy Policy</span>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;