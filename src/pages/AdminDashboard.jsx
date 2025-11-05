import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
// Assuming useDebounce is correctly implemented to delay value updates
import useDebounce from '../hooks/useDebounce'; 
// Assuming './AdminDashboard.css' is still used for overall layout/table styles,
// but we will primarily use inline styles for the new filter section.

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [customers, setCustomers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [customerIdFilter, setCustomerIdFilter] = useState('');
    const [phoneNumberFilter, setPhoneNumberFilter] = useState('');

    // --- Debounce the filter values ---
    const debouncedCustomerId = useDebounce(customerIdFilter, 500);
    const debouncedPhoneNumber = useDebounce(phoneNumberFilter, 500);

    // Initial Data Fetch: Dashboard Stats Only
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const dashData = await adminService.getDashboard();
                setDashboard(dashData);
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
                setError('Failed to load initial dashboard data.');
            }
        };
        fetchDashboardData();
    }, []);

    // --- Backend Fetch for Customers (Triggered by Debounced Filters) ---
    useEffect(() => {
        const fetchFilteredCustomers = async () => {
            setLoading(true);
            setError('');
            try {
                const customersData = await adminService.getFilteredCustomers(
                    debouncedCustomerId,
                    debouncedPhoneNumber 
                );
                const customerList = Array.isArray(customersData) ? customersData : [];
                setCustomers(customerList);
            } catch (err) {
                console.error('Failed to fetch filtered customers:', err);
                // Update the error to inform the user about the failure
                setError('Failed to fetch customer list. Check server logs for DTO/serialization errors.'); 
            } finally {
                setLoading(false);
            }
        };

        if (dashboard || !customerIdFilter && !phoneNumberFilter) {
              fetchFilteredCustomers();
        }
        
    }, [debouncedCustomerId, debouncedPhoneNumber, dashboard, customerIdFilter, phoneNumberFilter]); // Added customerIdFilter and phoneNumberFilter to ensure consistent state capture

    if (loading && !dashboard) return <div className="admin-loading">Loading Admin Portal...</div>;

    // --- INLINE STYLES DEFINITION (Non-navbar styles kept intact) ---
    const styles = {
        // Main Layout Styles
        dashboard: {
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f7f6', // Light background for the whole page
            minHeight: '100vh',
        },
        // Removed original navbar styles: navbar, navbarBrand, navbarLinks, navbarBtn

        // Filter Section Styles
        filtersSection: {
            // Updated background and border to be less intrusive with new dark navbar
            backgroundColor: '#ffffff', // White background
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            borderLeft: '5px solid #0f1724', // Border to match new navbar primary color
        },
        filterHeader: {
            color: '#333',
            marginBottom: '15px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px',
        },
        filterControls: {
            display: 'flex',
            gap: '20px',
        },
        filterInput: {
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            flexGrow: 1,
            fontSize: '16px',
        },
        // Error Style
        error: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb',
        }
    };
    
    // Mock logout for button functionality - replace with actual logic
    const handleLogout = () => {
        console.log("Admin Logout Clicked! Implement actual logout logic.");
        // Example: authService.logout();
    };

    return (
        <div className="admin-dashboard" style={styles.dashboard}>
            {/* NAVBAR: All styling now comes from the CSS file via class names.
                Removed inline styles on <nav>, <div>, and <ul>.
                <Link> components now use className="navbar__btn" 
            */}
            <nav className="navbar"> 
                <div className="navbar__brand">
                    CONNECTCOM
                </div>
                <ul className="navbar__links">
                    <li>
                        {/* The 'Link' tag renders as an anchor <a> which will pick up .navbar__btn styles */}
                        <Link to="/admin/customers/add" className="navbar__btn"> 
                               Add Customer
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/events" className="navbar__btn">
                               View All Events
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/rules" className="navbar__btn">
                               Manage Rules
                        </Link>
                    </li>
                    
                </ul>
            </nav>

            {/* --- Filtering Section Kept Intact (with slight style adjustment for consistency) --- */}
            <div className="admin-filters" style={styles.filtersSection}>
                <h3 style={styles.filterHeader}>Customer Filters 🔎</h3>
                <div className="filter-controls" style={styles.filterControls}>
                    <input
                        type="text"
                        placeholder="Filter by Customer ID"
                        value={customerIdFilter}
                        onChange={(e) => setCustomerIdFilter(e.target.value)}
                        style={styles.filterInput}
                    />
                    <input
                        type="text"
                        placeholder="Filter by Phone Number"
                        value={phoneNumberFilter}
                        onChange={(e) => setPhoneNumberFilter(e.target.value)}
                        style={styles.filterInput}
                    />
                </div>
            </div>
            {/* --- End Filtering Section --- */}
            
            {error && <div className="admin-error" style={styles.error}>{error}</div>}

            <div className="admin-content">
                <div className="admin-table-container">
                    {/* Assuming external CSS handles the 'admin-table' class for now */}
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (debouncedCustomerId !== customerIdFilter || debouncedPhoneNumber !== phoneNumberFilter) ? (
                                <tr>
                                    <td colSpan="6" className="admin-empty">
                                        Searching...
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? (
                                customers.map((customer, idx) => {
                                    // Fallback props are good, but stick to DTO props now
                                    const id = customer.customerId; // DTO field name
                                    const phone = customer.phone; // DTO field name
                                    const name = customer.name; // DTO field name
                                    const email = customer.email; // DTO field name
                                    const status = customer.status; // DTO field name

                                    return (
                                        <tr key={id ?? idx}>
                                            <td>{id}</td>
                                            <td>{name}</td>
                                            <td>{phone}</td>
                                            <td>{email}</td>
                                            <td>
                                                <span 
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9em',
                                                        color: status === 'ACTIVE' ? '#155724' : status === 'BLOCKED' ? '#721c24' : '#004085',
                                                        backgroundColor: status === 'ACTIVE' ? '#d4edda' : status === 'BLOCKED' ? '#f8d7da' : '#cce5ff',
                                                    }}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    to={`/admin/customers/${id}`}
                                                    className="admin-link"
                                                    style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="admin-empty">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;