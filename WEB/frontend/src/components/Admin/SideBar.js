import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, LogOut } from 'lucide-react';
import { useFirebase } from '../../context/FirebaseContext';

const SideBar = () => {
  const { logout } = useFirebase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside className="bg-white w-64 min-h-screen shadow-lg">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Hello Admin</h2>
      </div>
      <nav className="mt-4">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`
          }
        >
          <Users className="h-5 w-5 mr-3" />
          Users
        </NavLink>
        <NavLink
          to="/admin/courses"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`
          }
        >
          <BookOpen className="h-5 w-5 mr-3" />
          Courses
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 mt-auto"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default SideBar;
