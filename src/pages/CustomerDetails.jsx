import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import './AdminDashboard.css';

const CustomerDetails = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');    
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const cust = await adminService.getCustomerById(customerId);
            setCustomer(cust);            
        } catch (err) {
            console.error(err);
            setError('Failed to load customer details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [customerId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!customer) return <div>Customer not found</div>;

    const handleUpdateServiceStatus = async (serviceName, newStatus) => {
        setSaving(true);
        try {
            await adminService.updateServiceStatus(customer.customerId || customer.id, serviceName, newStatus);
            await fetchAll(); // Refetch all data to show the update
        } catch (err) {
            console.error(err);
            setError('Failed to update service status');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <nav className="admin-navbar">
                <div className="admin-logo">CUSTOMER DETAILS</div>
                <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600 hover:underline font-semibold">
                    ← Back to Dashboard
                </button>
            </nav>

            <div className="admin-content max-w-4xl mx-auto">
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</div>}

                {/* Basic Info Card */}
                <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Customer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>ID:</strong> {customer.customerId ?? customer.id}</div>
                        <div><strong>Name:</strong> {customer.name ?? customer.fullName}</div>
                        <div><strong>Email:</strong> {customer.email}</div>
                        <div><strong>Phone:</strong> {customer.phone ?? customer.phoneNumber}</div>
                        <div><strong>Overall Status:</strong> <span className={`font-semibold ${customer.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{customer.status}</span></div>
                    </div>
                </section>

                {/* Subscriptions/Plans Section */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Customer Plans & Services</h2>
                    {Array.isArray(customer.subscriptions) && customer.subscriptions.length > 0 ? (
                        <div className="space-y-4">
                            {customer.subscriptions.map(sub => {
                                const subId = sub.subscriptionId ?? sub.id;
                                return (
                                <div key={subId} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{sub.serviceName}</h3>
                                            <p className="text-sm text-gray-500">Subscription ID: {subId}</p>
                                            <p><strong>Due Amount:</strong> ${sub.dueAmount || '0.00'}</p>
                                            <p><strong>Next Payment:</strong> {sub.nextPaymentDate || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`status-${subId}`} className="font-semibold">Status:</label>
                                            <select 
                                                id={`status-${subId}`}
                                                value={sub.status} 
                                                onChange={(e) => handleUpdateServiceStatus(sub.serviceName, e.target.value)} 
                                                disabled={saving}
                                                className="admin-filter-input"
                                            >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="SUSPENDED">SUSPENDED</option>
                                        <option value="BLOCKED">BLOCKED</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-4">No subscriptions or plans found for this customer.</div>
                    )}
                </section>

                {/* Dunning Events History */}
                <section className="bg-white p-6 rounded-lg shadow-md mt-8">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Dunning Event History</h2>
                    {Array.isArray(customer.dunningEvents) && customer.dunningEvents.length > 0 ? (
                        <div className="admin-table-container -mx-6 -mb-6">
                            <table className="admin-table min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 border-b">Event ID</th>
                                        <th className="px-6 py-3 border-b">Service</th>
                                        <th className="px-6 py-3 border-b">Days Overdue</th>
                                        <th className="px-6 py-3 border-b">Status</th>
                                        <th className="px-6 py-3 border-b">Date Triggered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.dunningEvents.map(event => (
                                        <tr key={event.id}>
                                            <td className="px-6 py-4 border-b">{event.id}</td>
                                            <td className="px-6 py-4 border-b">{event.serviceName}</td>
                                            <td className="px-6 py-4 border-b">{event.daysOverdue}</td>
                                            <td className="px-6 py-4 border-b">
                                                <span className={`font-semibold ${event.status === 'RESOLVED' ? 'text-green-600' : 'text-orange-600'}`}>{event.status}</span>
                                            </td>
                                            <td className="px-6 py-4 border-b">{new Date(event.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-4">No dunning events found for this customer.</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CustomerDetails;