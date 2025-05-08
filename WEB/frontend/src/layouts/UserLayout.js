import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '../../context/FirebaseContext';
import UserSidebar from '../UserSideBar';

const UserLayout = () => {
  const { currentUser, logout } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <UserSidebar onSignOut={handleSignOut} /> {/* Reusable Sidebar Component */}

      {/* Main Content */}
      <div className="pl-64 flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
