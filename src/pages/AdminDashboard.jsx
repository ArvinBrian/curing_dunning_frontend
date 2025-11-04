import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [rawCustomersResponse, setRawCustomersResponse] = useState(null); // debug
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashData, customersData] = await Promise.all([
                    adminService.getDashboard(),
                    adminService.getFilteredCustomers()
                ]);

                console.log('Dashboard response:', dashData);
                console.log('Customers API returned (processed):', customersData);

                setRawCustomersResponse(customersData); // keep raw for debugging UI

                setDashboard(dashData);
                setCustomers(Array.isArray(customersData) ? customersData : []);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-dashboard p-6">
            <nav className="admin-navbar">
                <Link to="/admin/dashboard" className="admin-logo">CONNECTCOM</Link>
            </nav>

            <header className="admin-header mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}
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
                                // support multiple possible key names returned by backend
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
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No customers to display.
                                        {/* temporary debug dump */}
                                        {rawCustomersResponse && (
                                            <pre style={{textAlign:'left', marginTop:12, maxHeight:200, overflow:'auto'}}>
{JSON.stringify(rawCustomersResponse, null, 2)}
                                            </pre>
                                        )}
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