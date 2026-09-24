import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 flex">
            <AdminSidebar closeSidebar={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-gray-200 bg-white">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded text-gray-700 hover:bg-gray-100 mr-2"
          >
            ☰
          </button>
          <span className="font-bold text-gray-900">Rabbit Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
