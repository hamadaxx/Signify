import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  User, 
  LogOut, 
  ChevronRight,
  Trophy,
  Flame,
  Clock,
  Video
} from 'lucide-react';
import { useFirebase } from '../../context/FirebaseContext';

const UserSidebar = () => {
  const { currentUser, logout } = useFirebase();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: Home },
    { name: 'My Courses', href: '/user/courses', icon: BookOpen },
    { name: 'Progress', href: '/user/progress', icon: Trophy },
    { name: 'Profile', href: '/user/profile', icon: User },
  ];

  const progressStats = [
    { 
      icon: Trophy, 
      value: currentUser?.progress?.points || 0, 
      label: 'Points',
      color: 'text-[#f9bd04]'
    },
    { 
      icon: Flame, 
      value: currentUser?.progress?.streak || 0, 
      label: 'Day Streak',
      color: 'text-[#f95e54]'
    },
    { 
      icon: Video, 
      value: currentUser?.progress?.completedLessons?.length || 0, 
      label: 'Lessons',
      color: 'text-[#3151f9]'
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 flex flex-col">
      {/* Header Section */}
      <div className="p-6 bg-gradient-to-r from-[#3151f9] to-[#f9bd04]">
        <h1 className="text-2xl font-bold text-white mb-2">Signify</h1>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-medium">
              {currentUser?.firstName?.[0] || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {currentUser?.firstName || 'User'} {currentUser?.lastName}
            </p>
            <p className="text-xs text-white/80">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-3 gap-4">
          {progressStats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-2 bg-white rounded-lg shadow-sm"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-3 text-sm rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-[#f9bd04]/20 to-[#f95e54]/20 text-[#3151f9] font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-[#f95e54]' : 'text-gray-500'}`} />
              {item.name}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#f95e54]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Last active: {new Date(currentUser?.progress?.lastActive).toLocaleDateString()}</p>
          <p className="mt-1">v1.2.0</p>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;