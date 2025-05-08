import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Book, Video, User, Settings, LogOut } from 'lucide-react';
import { useFirebase } from '../../context/FirebaseContext';

const UserLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useFirebase();

    const menuItems = [
        { path: '/user/dashboard', label: 'Dashboard', icon: Book },
        { path: '/user/courses', label: 'My Courses', icon: Video },
        { path: '/user/profile', label: 'Profile', icon: User },
        { path: '/user/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-[#3151f9]">SIGNIFY</h1>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-[#3151f9] text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-64 p-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default UserLayout; 