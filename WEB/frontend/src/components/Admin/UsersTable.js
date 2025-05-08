import React from "react";
import { Users, Mail, CheckCircle, XCircle } from 'lucide-react';

const users = [
  { name: "Mohamed Ali Chammakhi", email: "medali@example.com", status: "Active" },
  { name: "Youssef Hamada", email: "hamada@example.com", status: "Inactive" },
  { name: "Charlie Brown", email: "charlie@example.com", status: "Active" },
  { name: "Sarah Johnson", email: "sarah@example.com", status: "Active" },
  { name: "Alex Martinez", email: "alex@example.com", status: "Inactive" },
  { name: "Emma Wilson", email: "emma@example.com", status: "Active" },
  { name: "Liam Smith", email: "liam@example.com", status: "Pending" },
  { name: "Olivia Davis", email: "olivia@example.com", status: "Active" },
];

const UsersTable = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-blue-600">User Management</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-blue-50 text-gray-600">
              <th className="p-3 text-left font-medium">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Name
                </span>
              </th>
              <th className="p-3 text-left font-medium">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
              </th>
              <th className="p-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={index} 
                className="border-t hover:bg-blue-50 transition-colors"
              >
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-gray-600">{user.email}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {user.status === "Active" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : user.status === "Inactive" ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <span className="w-4 h-4" />
                    )}
                    <span className={`px-3 py-1.5 rounded-full text-sm ${
                      user.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : user.status === "Inactive" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;