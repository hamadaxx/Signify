import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
