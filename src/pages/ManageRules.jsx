import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import './AdminDashboard.css'; // Re-use styles for consistency

const ManageRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for the form
    const [isEditing, setIsEditing] = useState(null); // Will hold the ID of the rule being edited
    const [formData, setFormData] = useState({
        serviceName: '',
        overdueDays: '',
        action: 'SEND_NOTIFICATION',
        priority: 1,
        planType: 'ALL',
        timeOfDay: '09:00',
        description: ''
    });

    const fetchRules = useCallback(async () => {
        try {
            setLoading(true);
            const rulesData = await adminService.getAllRules();
            setRules(Array.isArray(rulesData) ? rulesData : []);
        } catch (err) {
            setError('Failed to fetch dunning rules.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isEditing) {
                await adminService.updateRule(isEditing, formData);
                setSuccess(`Rule #${isEditing} updated successfully.`);
            } else {
                await adminService.createRule(formData);
                setSuccess('New rule created successfully.');
            }
            resetForm();
            fetchRules(); // Refresh the list
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred. Please check the console.';
            setError(errorMessage);
        }
    };

    const handleEditClick = (rule) => {
        setIsEditing(rule.id);
        setFormData({
            serviceName: rule.serviceName || '',
            overdueDays: rule.overdueDays || '',
            action: rule.action || 'SEND_NOTIFICATION',
            priority: rule.priority || 1,
            planType: rule.planType || 'ALL',
            timeOfDay: rule.timeOfDay || '09:00',
            description: rule.description || ''
        });
        window.scrollTo(0, 0); // Scroll to top to see the form
    };

    const handleDeleteClick = async (ruleId) => {
        if (window.confirm(`Are you sure you want to delete rule #${ruleId}? This action cannot be undone.`)) {
            try {
                await adminService.deleteRule(ruleId);
                setSuccess(`Rule #${ruleId} deleted successfully.`);
                fetchRules(); // Refresh the list
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to delete rule. It might be in use.';
                setError(errorMessage);
            }
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setFormData({
            serviceName: '',
            overdueDays: '',
            action: 'SEND_NOTIFICATION',
            priority: 1,
            planType: 'ALL',
            timeOfDay: '09:00',
            description: ''
        });
    };

    return (
        <div className="admin-dashboard p-6">
            <nav className="admin-navbar">
                <Link to="/admin/dashboard" className="admin-logo">CONNECTCOM</Link>
                <Link to="/admin/dashboard" className="text-blue-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="admin-content max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{isEditing ? `Editing Rule #${isEditing}` : 'Create New Dunning Rule'}</h1>

                {/* Form for Create/Edit */}
                <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
                    {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</div>}
                    {success && <div className="text-green-700 bg-green-100 p-3 rounded-lg mb-4">{success}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="serviceName" placeholder="Service Name (e.g., Broadband)" value={formData.serviceName} onChange={handleFormChange} className="admin-filter-input" required />
                        <input type="number" name="overdueDays" placeholder="Overdue Days" value={formData.overdueDays} onChange={handleFormChange} className="admin-filter-input" required />
                        <select name="action" value={formData.action} onChange={handleFormChange} className="admin-filter-input">
                            <option value="SEND_NOTIFICATION">Send Notification</option>
                            <option value="SUSPEND_SERVICE">Suspend Service</option>
                            <option value="BLOCK_SERVICE">Block Service</option>
                        </select>
                        <input type="number" name="priority" placeholder="Priority (1 is highest)" value={formData.priority} onChange={handleFormChange} className="admin-filter-input" required />
                        <select name="planType" value={formData.planType} onChange={handleFormChange} className="admin-filter-input">
                            <option value="ALL">All Plan Types</option>
                            <option value="PREPAID">Prepaid</option>
                            <option value="POSTPAID">Postpaid</option>
                        </select>
                        <input type="time" name="timeOfDay" value={formData.timeOfDay} onChange={handleFormChange} className="admin-filter-input" required />
                        <textarea name="description" placeholder="Description (optional)" value={formData.description} onChange={handleFormChange} className="admin-filter-input md:col-span-2" />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg">
                            {isEditing ? 'Update Rule' : 'Create Rule'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="bg-gray-500 text-white hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                {/* Table of Existing Rules */}
                <h2 className="text-2xl font-bold mb-4">Existing Rules</h2>
                <div className="admin-table-container">
                    <table className="admin-table min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b">ID</th>
                                <th className="px-6 py-3 border-b">Service</th>
                                <th className="px-6 py-3 border-b">Days Overdue</th>
                                <th className="px-6 py-3 border-b">Action</th>
                                <th className="px-6 py-3 border-b">Priority</th>
                                <th className="px-6 py-3 border-b">Plan Type</th>
                                <th className="px-6 py-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center p-4">Loading rules...</td></tr>
                            ) : rules.map(rule => (
                                <tr key={rule.id}>
                                    <td className="px-6 py-4 border-b">{rule.id}</td>
                                    <td className="px-6 py-4 border-b">{rule.serviceName}</td>
                                    <td className="px-6 py-4 border-b">{rule.overdueDays}</td>
                                    <td className="px-6 py-4 border-b">{rule.action}</td>
                                    <td className="px-6 py-4 border-b">{rule.priority}</td>
                                    <td className="px-6 py-4 border-b">{rule.planType}</td>
                                    <td className="px-6 py-4 border-b flex gap-4">
                                        <button onClick={() => handleEditClick(rule)} className="text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteClick(rule.id)} className="text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageRules;