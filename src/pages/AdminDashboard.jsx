import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import useDebounce from '../hooks/useDebounce';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [allCustomers, setAllCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [customerIdFilter, setCustomerIdFilter] = useState('');
    const [phoneNumberFilter, setPhoneNumberFilter] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [dashData, customersData] = await Promise.all([
                    adminService.getDashboard(),
                    adminService.getFilteredCustomers('', ''),
                ]);
                setDashboard(dashData);
                const customers = Array.isArray(customersData) ? customersData : [];
                setAllCustomers(customers);
                setFilteredCustomers(customers);
            } catch (err) {
                console.error('Failed to load initial data:', err);
                setError('Failed to load initial dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        let result = allCustomers;
        if (customerIdFilter)
            result = result.filter((c) =>
                String(c.customerId ?? c.id ?? '').includes(customerIdFilter)
            );
        if (phoneNumberFilter)
            result = result.filter((c) =>
                String(c.phone ?? c.phoneNumber ?? '').includes(phoneNumberFilter)
            );
        setFilteredCustomers(result);
    }, [customerIdFilter, phoneNumberFilter, allCustomers]);

    if (loading && !dashboard) return <div>Loading Admin Portal...</div>;

    return (
        <div className="admin-dashboard">
            {/* Navbar with the new styling */}
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
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer, idx) => {
                                    const id =
                                        customer.customerId ??
                                        customer.customer_id ??
                                        customer.id;
                                    const phone =
                                        customer.phone ??
                                        customer.phoneNumber ??
                                        customer.mobile ??
                                        '';
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
                                        {loading
                                            ? 'Searching...'
                                            : 'No customers found.'}
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
