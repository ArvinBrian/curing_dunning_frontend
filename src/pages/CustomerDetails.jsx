import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import './AdminDashboard.css';

const CustomerDetails = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rules, setRules] = useState([]);
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const cust = await adminService.getCustomerById(customerId);
            setCustomer(cust);
            const allRules = await adminService.getAllRules();
            setRules(Array.isArray(allRules) ? allRules : []);
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

    const handleUpdateSubscription = async (subId, updates) => {
        setSaving(true);
        try {
            await adminService.updateSubscription(subId, updates);
            await fetchAll();
        } catch (err) {
            console.error(err);
            setError('Failed to update subscription');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateServiceStatus = async (serviceName, newStatus) => {
        setSaving(true);
        try {
            await adminService.updateServiceStatus(customer.customerId || customer.id, serviceName, newStatus);
            await fetchAll();
        } catch (err) {
            console.error(err);
            setError('Failed to update service status');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <nav className="mb-6">
                <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
                    ← Back
                </button>
            </nav>

            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Customer Details</h1>

                <section className="mb-6">
                    <h2 className="font-semibold">Basic Info</h2>
                    <p><strong>ID:</strong> {customer.customerId ?? customer.id}</p>
                    <p><strong>Name:</strong> {customer.name ?? customer.fullName}</p>
                    <p><strong>Email:</strong> {customer.email}</p>
                    <p><strong>Phone:</strong> {customer.phone ?? customer.phoneNumber}</p>
                    <p><strong>Status:</strong> {customer.status}</p>
                </section>

                <section className="mb-6">
                    <h2 className="font-semibold">Subscriptions</h2>
                    {Array.isArray(customer.subscriptions) && customer.subscriptions.length > 0 ? (
                        <div className="space-y-4">
                            {customer.subscriptions.map(sub => (
                                <div key={sub.subscriptionId ?? sub.id} className="p-4 border rounded">
                                    <p><strong>Subscription ID:</strong> {sub.subscriptionId ?? sub.id}</p>
                                    <p><strong>Service:</strong> {sub.serviceName}</p>
                                    <p><strong>Status:</strong> {sub.status}</p>
                                    <p><strong>Due Amount:</strong> {sub.dueAmount}</p>
                                    <p><strong>Next Payment Date:</strong> {sub.nextPaymentDate}</p>

                                    <div className="mt-2 flex gap-2">
                                        <select defaultValue={sub.status} onChange={(e) => handleUpdateSubscription(sub.subscriptionId ?? sub.id, { status: e.target.value })} disabled={saving}>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="SUSPENDED">SUSPENDED</option>
                                            <option value="BLOCKED">BLOCKED</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                        </select>

                                        <button onClick={() => handleUpdateSubscription(sub.subscriptionId ?? sub.id, { status: sub.status })} className="bg-blue-500 text-white px-3 py-1 rounded" disabled={saving}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>No subscriptions</div>
                    )}
                </section>

                <section className="mb-6">
                    <h2 className="font-semibold">Services (Manual Status Override)</h2>
                    {Array.isArray(customer.services) && customer.services.length > 0 ? (
                        customer.services.map(svc => (
                            <div key={svc.serviceName} className="p-3 border rounded mb-2 flex items-center justify-between">
                                <div>
                                    <strong>{svc.serviceName}</strong>
                                    <div className="text-sm">Status: {svc.status}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select defaultValue={svc.status} onChange={(e) => handleUpdateServiceStatus(svc.serviceName, e.target.value)} disabled={saving}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="SUSPENDED">SUSPENDED</option>
                                        <option value="BLOCKED">BLOCKED</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Some backends expose services as derived from subscriptions - fall back to subscriptions
                        Array.isArray(customer.subscriptions) && customer.subscriptions.length > 0 ? (
                            customer.subscriptions.map(sub => (
                                <div key={sub.subscriptionId ?? sub.id} className="p-3 border rounded mb-2 flex items-center justify-between">
                                    <div>
                                        <strong>{sub.serviceName}</strong>
                                        <div className="text-sm">Status: {sub.status}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select defaultValue={sub.status} onChange={(e) => handleUpdateServiceStatus(sub.customerId ?? customer.customerId ?? customer.id, sub.serviceName, e.target.value)} disabled={saving}>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="SUSPENDED">SUSPENDED</option>
                                            <option value="BLOCKED">BLOCKED</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                        </select>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>No service info available</div>
                        )
                    )}
                </section>

                <section>
                    <h2 className="font-semibold">Dunning Rules (Admin)</h2>
                    <div className="space-y-2 mt-2">
                        {rules.map(r => (
                            <div key={r.id} className="p-2 border rounded flex justify-between">
                                <div>
                                    <div className="font-medium">{r.serviceName}</div>
                                    <div className="text-sm">Overdue days: {r.overdueDays} | Action: {r.action}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/admin/rules/${r.id}`} className="text-blue-600">Edit</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CustomerDetails;