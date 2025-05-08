import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, Book, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser } = useFirebase();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    newSignups: 0
  });

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const totalCourses = coursesSnapshot.size;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newSignupsQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', thirtyDaysAgo)
      );
      const newSignupsSnapshot = await getDocs(newSignupsQuery);
      const newSignups = newSignupsSnapshot.size;

      setStats({ totalUsers, totalCourses, newSignups });

      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fullName: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'N/A'
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-400 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-red-400 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Total Courses</h3>
          <p className="text-4xl font-bold">{stats.totalCourses}</p>
        </div>
        <div className="bg-blue-500 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-2">New Signups</h3>
          <p className="text-4xl font-bold">{stats.newSignups}</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Alice Johnson</p>
                <p className="text-sm text-gray-500">finished a vocabulary quiz</p>
                <p className="text-xs text-gray-400">2h ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Book className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Bob Smith</p>
                <p className="text-sm text-gray-500">enrolled in Beginner's ASL course</p>
                <p className="text-xs text-gray-400">5h ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
