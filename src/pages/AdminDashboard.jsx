import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
// Assuming useDebounce is correctly implemented to delay value updates
import useDebounce from '../hooks/useDebounce'; 
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    // Renamed to 'customers' as this will hold the actively filtered list
    const [customers, setCustomers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [customerIdFilter, setCustomerIdFilter] = useState('');
    const [phoneNumberFilter, setPhoneNumberFilter] = useState('');

    // --- Debounce the filter values ---
    // This will only update the debounced value a short time after the user stops typing
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
    // This effect runs whenever the debounced filter values change.
    useEffect(() => {
        const fetchFilteredCustomers = async () => {
            setLoading(true);
            setError('');
            try {
                const customersData = await adminService.getFilteredCustomers(
                    debouncedCustomerId,
                    debouncedPhoneNumber 
                );
                // Ensure the result is an array, though the backend should handle this
                const customerList = Array.isArray(customersData) ? customersData : [];
                setCustomers(customerList);
            } catch (err) {
                console.error('Failed to fetch filtered customers:', err);
                setError('Failed to fetch customer list.');
            } finally {
                setLoading(false);
            }
        };

        // We only fetch if the dashboard data has loaded or we are certain we need to search.
        // Given that debounced values start as empty strings, the initial fetch
        // will happen here with an empty filter, fetching all customers.
        if (dashboard || !customerIdFilter && !phoneNumberFilter) {
             fetchFilteredCustomers();
        }
       
    }, [debouncedCustomerId, debouncedPhoneNumber, dashboard]); // Dependencies on debounced values

    // The old client-side filtering logic is removed:
    // useEffect(() => { ... }, [customerIdFilter, phoneNumberFilter, allCustomers]);

    if (loading && !dashboard) return <div className="admin-loading">Loading Admin Portal...</div>;

    return (
        <div className="admin-dashboard">
            <nav className="navbar">
                <div className="navbar__brand">
                    CONNECTCOM
                </div>
                <ul className="navbar__links">
                    <li>
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

            {/* --- Filtering Section Added --- */}
            <div className="admin-filters">
                <h3>Customer Filters</h3>
                <div className="filter-controls">
                    <input
                        type="text"
                        placeholder="Filter by Customer ID"
                        value={customerIdFilter}
                        onChange={(e) => setCustomerIdFilter(e.target.value)}
                        className="filter-input"
                    />
                    <input
                        type="text"
                        placeholder="Filter by Phone Number"
                        value={phoneNumberFilter}
                        onChange={(e) => setPhoneNumberFilter(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>
            {/* --- End Filtering Section --- */}
            
            {error && <div className="admin-error">{error}</div>}

            <div className="admin-content">
                <div className="admin-table-container">
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
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="admin-empty">
                                        Searching...
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? (
                                customers.map((customer, idx) => {
                                    const id = customer.customerId ?? customer.customer_id ?? customer.id;
                                    const phone = customer.phone ?? customer.phoneNumber ?? customer.mobile ?? '';
                                    const name = customer.name ?? customer.fullName ?? '';
                                    const email = customer.email ?? '';
                                    const status = customer.status ?? '';

                                    return (
                                        <tr key={id ?? idx}>
                                            <td>{id}</td>
                                            <td>{name}</td>
                                            <td>{phone}</td>
                                            <td>{email}</td>
                                            <td>{status}</td>
                                            <td>
                                                <Link
                                                    to={`/admin/customers/${id}`}
                                                    className="admin-link"
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