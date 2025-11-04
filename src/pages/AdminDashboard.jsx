// File: src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import useDebounce from '../hooks/useDebounce'; // <-- IMPORT THE HOOK
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [allCustomers, setAllCustomers] = useState([]); // Holds the master list of all customers
    const [filteredCustomers, setFilteredCustomers] = useState([]); // Holds the list to be displayed
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for immediate user input
    const [customerIdFilter, setCustomerIdFilter] = useState(''); 
    const [phoneNumberFilter, setPhoneNumberFilter] = useState('');

    // --- EFFECT 1: Initial Data Fetch (Runs Once) ---
    // Fetches dashboard stats AND the complete list of all customers.
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Use Promise.all to fetch both sets of data concurrently
                const [dashData, customersData] = await Promise.all([
                    adminService.getDashboard(),
                    adminService.getFilteredCustomers('', '') // Fetch ALL customers
                ]);

                setDashboard(dashData);

                const customers = Array.isArray(customersData) ? customersData : [];
                setAllCustomers(customers); // Store the master list
                setFilteredCustomers(customers); // Initially, the filtered list is the same as the master list

            } catch (err) {
                console.error('Failed to load initial data:', err);
                setError('Failed to load initial dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []); // Empty dependency array ensures this runs only once


    // --- EFFECT 2: Client-Side Filtering ---
    // This effect runs whenever the user types into the filter inputs.
    // It filters the `allCustomers` list without making new API calls.
    useEffect(() => {
        let result = allCustomers;

        if (customerIdFilter) {
            result = result.filter(c => String(c.customerId ?? c.id ?? '').includes(customerIdFilter));
        }

        if (phoneNumberFilter) {
            result = result.filter(c => String(c.phone ?? c.phoneNumber ?? '').includes(phoneNumberFilter));
        }

        setFilteredCustomers(result);

    }, [customerIdFilter, phoneNumberFilter, allCustomers]); 
    // ^ This effect re-runs when filter inputs change or when the master list is updated.


    if (loading && !dashboard) return <div>Loading Admin Portal...</div>;

    return (
        <div className="admin-dashboard p-6">
            <nav className="admin-navbar">
                <Link to="/admin/dashboard" className="admin-logo">CONNECTCOM</Link>
                <div className="navbar-actions">
                    <Link to="/admin/customers/add" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300">
                        Add Customer
                    </Link>
                    <Link to="/admin/rules" className="bg-gray-700 text-white hover:bg-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300">
                        Manage Rules
                    </Link>
                </div>
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
                            {filteredCustomers.length > 0 ? filteredCustomers.map((customer, idx) => {
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