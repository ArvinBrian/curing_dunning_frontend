import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCreditCard, FaHeadset, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import authService from '../services/authService';
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

/* --- Helper: Service Card (Pure presentational) --- */
const ServiceCard = ({ service }) => {
    const statusClass = service.currentStatus ? service.currentStatus.toLowerCase() : 'unknown';
    return (
        <div className="service-card">
            <div className="service-card__head">
                <h3 className="service-card__title">{service.serviceName}</h3>
                <span className={`service-card__status status-box ${statusClass}`}>
                    {service.currentStatus || 'N/A'}
                </span>
            </div>
            {service.statusText && <p className="service-card__desc">{service.statusText}</p>}
            {service.pendingAction && (
                <p className="service-card__action">Action Needed: {service.pendingAction.replace(/_/g, ' ')}</p>
            )}
        </div>
    );
};


/* --- Helper: Dunning Event List (Pure presentational) --- */
const DunningEventList = ({ events }) => {
    const filteredEvents = (events || [])
        .filter(event => event.status === 'PENDING' || event.status === 'RESOLVED')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filteredEvents.length === 0) {
        return <p className="dunning-list__empty">No recent dunning events found.</p>;
    }

    return (
        <div className="dunning-list">
            {filteredEvents.map((event) => (
                <div key={event.id} className={`dunning-item dunning-item--${event.status.toLowerCase()}`}>
                    <div className="dunning-item__grid">
                        <div>
                            <p className="dunning-item__label"><strong>Service</strong></p>
                            <p className="dunning-item__value">{event.serviceName}</p>
                        </div>

                        <div>
                            <p className="dunning-item__label"><strong>Status</strong></p>
                            <p className="dunning-item__value">
                                <span className={`status-box ${event.status.toLowerCase()}`}>{event.status}</span>
                            </p>
                        </div>

                        <div>
                            <p className="dunning-item__label"><strong>Days Overdue</strong></p>
                            <p className="dunning-item__value">{event.daysOverdue}</p>
                        </div>

                        <div>
                            <p className="dunning-item__label"><strong>Triggered</strong></p>
                            <p className="dunning-item__value">{new Date(event.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {event.status === 'PENDING' && event.pendingAction && (
                        <p className="dunning-item__action">Recommended Action: {event.pendingAction.replace(/_/g, ' ')}</p>
                    )}

                    {event.status === 'RESOLVED' && event.resolvedAt && (
                        <p className="dunning-item__resolved">Resolved: {new Date(event.resolvedAt).toLocaleDateString()}</p>
                    )}

                    {event.status === 'PENDING' && !event.resolvedAt && (
                        <p className="dunning-item__resolved">Resolution Required</p>
                    )}
                </div>
            ))}
        </div>
    );
};


/* --- Main Dashboard Component --- */
const Dashboard = () => {
    const navigate = useNavigate();
    const { customerData, isLoading, error, user } = useDashboardData(navigate);

    const welcomeName = user && user.email ? user.email.split('@')[0] : 'Customer';

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner" aria-hidden="true"></div>
                <p className="dashboard-container__loading-text">Loading dashboard...</p>
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

    return (
        <div className="dashboard-layout">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar__brand">CONNECTCOM</div>
                <ul className="navbar__links">
                    <li><button onClick={() => navigate('/dashboard')} className="navbar__btn"><FaHome /> <span>Home</span></button></li>
                    <li><button onClick={() => navigate('/pay-bills')} className="navbar__btn"><FaCreditCard /> <span>Pay Bills</span></button></li>
                    <li><button onClick={() => navigate('/payment-history')} className="navbar__btn"><FaHistory /> <span>Payment History</span></button></li>
                    <li><button onClick={() => navigate('/support')} className="navbar__btn"><FaHeadset /> <span>Support</span></button></li>
                    <li><button onClick={handleLogout} className="navbar__btn navbar__btn--logout"><FaSignOutAlt /> <span>Log Out</span></button></li>
                </ul>
            </nav>

            <main className="dashboard-content-wrapper">
                <header className="dashboard-header">
                    <h1 className="dashboard-header__title">Welcome, {welcomeName}!</h1>
                    <p className="dashboard-header__subtitle">Here's an overview of your services and billing events.</p>
                </header>

                {/* Two-column main sections: Services (left) / Dunning (right) */}
                <div className="dashboard-main-sections">
                    <section className="services-section card">
                        <div className="card__header">
                            <h2 className="card__title">Your Services</h2>
                        </div>

                        <div className="service-cards-container">
                            {customerData.services && customerData.services.length > 0 ? (
                                customerData.services.map((service, index) => (
                                    <ServiceCard key={index} service={service} />
                                ))
                            ) : (
                                <p className="muted-text">No active services found.</p>
                            )}
                        </div>
                    </section>

                    <section className="dunning-events-section card">
                        <div className="card__header">
                            <h2 className="card__title">Dunning Events</h2>
                        </div>

                        <DunningEventList events={customerData.events || []} />
                    </section>
                </div>

                <footer className="dashboard-footer">
                    <span>Copyright © 2025 CONNECTCOM LTD.</span>
                    <span className="dashboard-footer__policy">Privacy Policy</span>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;