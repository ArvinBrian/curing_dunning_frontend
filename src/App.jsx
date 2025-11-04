import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// General Components - FIX: Added .jsx extension for explicit resolution
import Login from './components/Login.js';
import Dashboard from './components/Dashboard.jsx';
import PayBills from './components/PayBills.jsx';
import PaymentHistory from './components/PaymentHistory.jsx';
import CustomerSupport from './components/CustomerSupport.jsx';

// Admin Components - FIX: Added .jsx extension for explicit resolution
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CustomerDetails from './pages/CustomerDetails.jsx';
import AddCustomer from './pages/AddCustomer.jsx'; // Import the new page
import ManageRules from './pages/ManageRules.jsx';
import AllEvents from './pages/AllEvents.jsx';


// --- Private Route Helper ---
// Ensures a user is logged in before accessing the component
// --- Private Route Helper ---
// Ensures a user is logged in by checking a mock token in localStorage.
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('user_token');
    
    if (!token) {
        // Redirect to login if there's no token
        return <Navigate to="/login" replace />;
    }
    
    return children;
};


// --- Admin Route Helper (Mocked Authorization) ---
// In a real app, this would check a 'role' property on the user's Firestore profile.
const AdminRoute = ({ children }) => {
    // Check for a specific admin token key set in localStorage during mock AdminLogin
    const isAdminAuthenticated = localStorage.getItem('admin_token_cc');

    // We navigate to /admin (which renders AdminLogin) if not authorized
    return isAdminAuthenticated ? children : <Navigate to="/admin/login" />;
};


const App = () => {
    return (
        <Router>
            <Routes>
                {/* Default Routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />

                {/* Customer Routes (Require Auth) */}
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/pay-bills" element={<PrivateRoute><PayBills /></PrivateRoute>} />
                <Route path="/payment-history" element={<PrivateRoute><PaymentHistory /></PrivateRoute>} />
                <Route path="/support" element={<PrivateRoute><CustomerSupport /></PrivateRoute>} />

                {/* Admin Routes (Require Admin Auth) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />
                <Route 
                    path="/admin/customers/:customerId" 
                    element={
                        <AdminRoute>
                            <CustomerDetails />
                        </AdminRoute>
                    } 
                />
                {/* Add the new route for the Add Customer page */}
                <Route 
                    path="/admin/customers/add"
                    element={
                        <AdminRoute>
                            <AddCustomer />
                        </AdminRoute>
                    }
                />
                {/* Add the new route for the Manage Rules page */}
                <Route 
                    path="/admin/rules"
                    element={
                        <AdminRoute>
                            <ManageRules />
                        </AdminRoute>
                    }
                />
                {/* This is the missing route for the "View All Events" page */}
                <Route 
                    path="/admin/events"
                    element={
                        <AdminRoute>
                            <AllEvents />
                        </AdminRoute>
                    }
                />
                {/* Fallback */}
                <Route path="*" element={<h1 className="text-center p-10 text-xl font-bold">404 - Not Found</h1>} />
            </Routes>
        </Router>
    );
};

export default App;