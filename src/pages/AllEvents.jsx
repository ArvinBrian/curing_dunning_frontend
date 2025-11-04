import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import useDebounce from '../hooks/useDebounce.js';
import './AdminDashboard.css';

const AllEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [planTypeFilter, setPlanTypeFilter] = useState('');
    const [serviceNameFilter, setServiceNameFilter] = useState('');

    // Debounce filter values to prevent API calls on every keystroke
    const debouncedStatus = useDebounce(statusFilter, 500);
    const debouncedPlanType = useDebounce(planTypeFilter, 500);
    const debouncedServiceName = useDebounce(serviceNameFilter, 500);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (debouncedStatus) filters.status = debouncedStatus;
            if (debouncedPlanType) filters.planType = debouncedPlanType;
            if (debouncedServiceName) filters.serviceName = debouncedServiceName;

            const eventsData = await adminService.getAllEvents(filters);
            setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (err) {
            setError('Failed to fetch dunning events.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [debouncedStatus, debouncedPlanType, debouncedServiceName]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return (
        <div className="admin-dashboard p-6">
            <nav className="admin-navbar">
                <Link to="/admin/dashboard" className="admin-logo">CONNECTCOM</Link>
                <Link to="/admin/dashboard" className="text-blue-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="admin-content max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">All Dunning Events</h1>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</div>}

                {/* Filter Inputs */}
                <div className="admin-filters mb-6">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="admin-filter-input"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="NOTIFIED">Notified</option>
                    </select>
                    <select
                        value={planTypeFilter}
                        onChange={(e) => setPlanTypeFilter(e.target.value)}
                        className="admin-filter-input"
                    >
                        <option value="">All Plan Types</option>
                        <option value="PREPAID">Prepaid</option>
                        <option value="POSTPAID">Postpaid</option>
                    </select>
                    <select
                        value={serviceNameFilter}
                        onChange={(e) => setServiceNameFilter(e.target.value)}
                        className="admin-filter-input"
                    >
                        <option value="">All Services</option>
                        <option value="Mobile">Mobile</option>
                        <option value="WiFi">WiFi</option>
                        <option value="Broadband">Broadband</option>
                    </select>
                </div>

                {/* Events Table */}
                <div className="admin-table-container">
                    <table className="admin-table min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b">Event ID</th>
                                <th className="px-6 py-3 border-b">Customer ID</th>
                                <th className="px-6 py-3 border-b">Service</th>
                                <th className="px-6 py-3 border-b">Status</th>
                                <th className="px-6 py-3 border-b">Plan Type</th>
                                <th className="px-6 py-3 border-b">Date Triggered</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center p-4">Loading events...</td></tr>
                            ) : events.length > 0 ? events.map(event => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 border-b">{event.id || event.eventId}</td>
                                    <td className="px-6 py-4 border-b">{event.customerId || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b">{event.serviceName}</td>
                                    <td className="px-6 py-4 border-b">{event.status}</td>
                                    <td className="px-6 py-4 border-b">{event.planType || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b">{new Date(event.createdAt).toLocaleDateString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center p-4">No events found for the selected filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllEvents;