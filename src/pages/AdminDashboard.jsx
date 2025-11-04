// File: src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import useDebounce from '../hooks/useDebounce'; // <-- IMPORT THE HOOK
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for immediate user input
    const [customerIdFilter, setCustomerIdFilter] = useState(''); 
    const [phoneNumberFilter, setPhoneNumberFilter] = useState('');

    // --- Apply the Debounce Hook ---
    const debouncedCustomerId = useDebounce(customerIdFilter, 500); // 500ms delay
    const debouncedPhoneNumber = useDebounce(phoneNumberFilter, 500); // 500ms delay


    // --- EFFECT 1: Fetch Dashboard Stats (Runs Once) ---
    useEffect(() => {
        const fetchDashboardStats = async () => {
            setLoading(true);
            try {
                const dashData = await adminService.getDashboard();
                setDashboard(dashData);
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, []); // Empty dependency array ensures this runs only once


    // --- EFFECT 2: Fetch Customers based on filters (debounced) ---
    // This single effect handles both the initial load (filters are empty)
    // and subsequent searches.
    useEffect(() => {
        const fetchFilteredData = async () => {
            setLoading(true); // Indicate that a new search is happening
            setError('');
            try {
                // This now correctly calls the /customers endpoint.
                // If filters are empty, it fetches all customers.
                // If filters have values, it fetches filtered results.
                const customersData = await adminService.getFilteredCustomers(
                    debouncedCustomerId, 
                    debouncedPhoneNumber
                );
                setCustomers(Array.isArray(customersData) ? customersData : []);
            } catch (err) {
                console.error('Filter search error:', err);
                setError('Failed to fetch customer data.');
                setCustomers([]); // Clear customers on error
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredData();
        
    }, [debouncedCustomerId, debouncedPhoneNumber]); 
    // ^ This effect re-runs whenever the debounced filter values change.


    if (loading && !dashboard) return <div>Loading Admin Portal...</div>;

    return (
        <div className="admin-dashboard p-6">
            <nav className="admin-navbar">
                <Link to="/admin/dashboard" className="admin-logo">CONNECTCOM</Link>
            </nav>

            <header className="admin-header mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}

                {/* Filter inputs for Customer ID and Phone */}
                <div className="admin-filter-container mt-4">
                    <input
                        type="text"
                        placeholder="Customer ID"
                        value={customerIdFilter}
                        onChange={(e) => setCustomerIdFilter(e.target.value)}
                        className="admin-filter-input"
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={phoneNumberFilter}
                        onChange={(e) => setPhoneNumberFilter(e.target.value)}
                        className="admin-filter-input"
                    />
                </div>

                <div className="admin-stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="stat-card bg-white p-4 rounded-lg shadow">
                        <h3 className="text-gray-500">Total Customers</h3>
                        <p className="text-2xl font-bold">{dashboard?.totalCustomers || 0}</p>
                    </div>
                </div>
            </header>

            <div className="admin-content">
                <div className="admin-table-container">
                    <table className="admin-table min-w-full bg-white rounded-lg shadow">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-6 py-3 border-b">Customer ID</th>
                                <th className="px-6 py-3 border-b">Name</th>
                                <th className="px-6 py-3 border-b">Phone</th>
                                <th className="px-6 py-3 border-b">Email</th>
                                <th className="px-6 py-3 border-b">Status</th>
                                <th className="px-6 py-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? customers.map((customer, idx) => {
                                const id = customer.customerId ?? customer.customer_id ?? customer.id ?? customer.customerId;
                                const phone = customer.phone ?? customer.phoneNumber ?? customer.mobile ?? '';
                                const name = customer.name ?? customer.fullName ?? '';
                                const email = customer.email ?? '';
                                const status = customer.status ?? '';

                                return (
                                    <tr key={id ?? idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 border-b">{id}</td>
                                        <td className="px-6 py-4 border-b">{name}</td>
                                        <td className="px-6 py-4 border-b">{phone}</td>
                                        <td className="px-6 py-4 border-b">{email}</td>
                                        <td className="px-6 py-4 border-b">{status}</td>
                                        <td className="px-6 py-4 border-b">
                                            <Link to={`/admin/customers/${id}`} className="text-blue-600 hover:text-blue-800">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-semibold">
                                        {loading ? 'Searching...' : 
                                        'No customers found. (Check console for API errors if this persists.)'}
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