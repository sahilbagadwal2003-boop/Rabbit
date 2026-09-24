import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminSidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    toast.info('Logged out from admin panel');
    navigate('/login');
  };

  const linkClass = (isActive) =>
    `flex items-center w-full px-4 py-3 text-sm font-medium rounded transition-colors ${
      isActive
        ? 'bg-gray-700 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <aside className="w-44 bg-[#1a1a2e] text-white min-h-screen flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-700">
        <Link to="/admin" className="text-lg font-bold text-white tracking-wide">
          Rabbit
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink
          to="/admin/users"
          onClick={closeSidebar}
          className={({ isActive }) => linkClass(isActive)}
        >
          <span className="mr-2">👤</span> Users
        </NavLink>

        <NavLink
          to="/admin/products"
          onClick={closeSidebar}
          className={({ isActive }) => linkClass(isActive)}
        >
          <span className="mr-2">📦</span> Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          end={false}
          onClick={closeSidebar}
          className={({ isActive }) => linkClass(isActive)}
        >
          <span className="mr-2">📋</span> Orders
        </NavLink>

        <NavLink
          to="/"
          onClick={closeSidebar}
          className={() => linkClass(false)}
        >
          <span className="mr-2">🛍️</span> Shop
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition cursor-pointer"
        >
          <span className="mr-2">→</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
