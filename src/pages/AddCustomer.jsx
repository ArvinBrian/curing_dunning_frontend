import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../services/adminService';
import './AddCustomer.css'; // Re-use styles for consistency

const AddCustomer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Name, Email, and Password are required.');
            setLoading(false);
            return;
        }

        try {
            const newCustomer = await adminService.createCustomer(formData);
            setSuccess(`Successfully created customer ${newCustomer.name} (ID: ${newCustomer.customerId}).`);
            // Optionally, navigate away after a delay
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to create customer. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard p-6">
            <nav className="admin-navbar">
                <Link to="/admin/dashboard" className="admin-logo">CONNECTCOM</Link>
                <Link to="/admin/dashboard" className="text-blue-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="admin-content max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Add New Customer</h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
                    {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</div>}
                    {success && <div className="text-green-700 bg-green-100 p-3 rounded-lg mb-4">{success}</div>}

                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="name">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="admin-filter-input w-full" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="email">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="admin-filter-input w-full" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="password">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="admin-filter-input w-full" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="phone">Phone Number</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="admin-filter-input w-full" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-300">
                        {loading ? 'Creating...' : 'Create Customer'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCustomer;
