// PASTE THIS CODE IN: src/routers/AdminRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // You must install this!

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // 1. No token at all, send to admin login
    return <Navigate to="/admin" replace />;
  }

  try {
    // 2. We have a token. Let's decode it
    const decodedToken = jwtDecode(token);
    
    // 3. Check if it's expired
    const isExpired = decodedToken.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem('token');
      return <Navigate to="/admin" replace />;
    }

    // 4. Check if the role is "admin"
    if (decodedToken.role === 'admin') {
      // 5. Success! They are an admin, show the dashboard
      return children ? children : <Outlet />;
    } else {
      // 6. They are a regular user (from Firebase), send them to the home page
      return <Navigate to="/" replace />;
    }

  } catch (error) {
    // 7. Token is malformed or invalid
    console.error("Failed to decode token", error);
    localStorage.removeItem('token');
    return <Navigate to="/admin" replace />;
  }
};

export default AdminRoute;