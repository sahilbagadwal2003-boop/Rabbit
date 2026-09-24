import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const AdminRoute = () => {
  useEffect(() => {
    // Ensure an admin session exists in localStorage for frontend development
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            _id: '65f1a2b3c4d5e6f7a8b9c001',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
          })
        );
      }
      if (!localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', 'admin_demo_token');
      }
    } catch (_) {}
  }, []);

  return <Outlet />;
};

export default AdminRoute;
