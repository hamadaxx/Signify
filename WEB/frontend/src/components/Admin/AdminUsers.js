import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

const AdminUsers = () => {
    const { db } = useFirebase();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        console.log('Database instance:', db); // Debug log
        if (db) {
            fetchUsers();
        } else {
            console.error('Database not initialized'); // Debug log
            setError('Database not initialized');
        }
    }, [db]);

    const fetchUsers = async () => {
        if (!db) {
            console.error('Database not initialized in fetchUsers'); // Debug log
            setError('Database not initialized');
            return;
        }

        try {
            setLoading(true);
            setError('');
            console.log('Fetching users from Firestore...'); // Debug log
            const usersCollection = collection(db, 'users');
            const snapshot = await getDocs(usersCollection);
            console.log('Snapshot size:', snapshot.size); // Debug log
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('User data:', data); // Debug log
                return {
                    id: doc.id,
                    ...data,
                    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'N/A'
                };
            });
            console.log('Processed users data:', usersData); // Debug log
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Error fetching users: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (!db) {
            setError('Database not initialized');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                role: newRole
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            setError('Error updating user role: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId, newStatus) => {
        if (!db) {
            setError('Database not initialized');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                status: newStatus
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            setError('Error updating user status: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3151f9]"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                        <input
                            type="text"
                            placeholder="Search by email or name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3151f9] focus:border-[#3151f9]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3151f9] focus:border-[#3151f9]"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            
                        </select>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-600 font-medium">
                                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                className="text-sm text-gray-900 bg-transparent border-0 focus:ring-0"
                                                value={user.role || 'student'}
                                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                               
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                className="text-sm text-gray-900 bg-transparent border-0 focus:ring-0"
                                                value={user.status || 'active'}
                                                onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                                            >
                                                <option value="active">Active</option>
                                                <option value="suspended">Suspended</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </td>
                                      
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers; 