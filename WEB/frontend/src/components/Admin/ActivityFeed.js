import React from "react";
import { Activity, CheckCircle, BookOpen, Trophy, Clock, UserPlus, Award } from 'lucide-react';

const activities = [
  { user: "Alice Johnson", action: "finished a vocabulary quiz", time: "2h ago", icon: <CheckCircle className="w-5 h-5" /> },
  { user: "Bob Smith", action: "enrolled in Beginner’s ASL course", time: "5h ago", icon: <BookOpen className="w-5 h-5" /> },
  { user: "Charlie Brown", action: "earned the Master Communicator Badge", time: "1d ago", icon: <Trophy className="w-5 h-5" /> },
  { user: "Diana Miller", action: "watched a tutorial on finger-spelling", time: "3h ago", icon: <UserPlus className="w-5 h-5" /> },
  { user: "Ethan Hunt", action: "completed the Advanced ASL fluency course", time: "4h ago", icon: <Award className="w-5 h-5" /> },
];

const ActivityFeed = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-blue-600">Recent Activity</h2>
      </div>
      
      <ul className="space-y-4">
        {activities.map((activity, index) => (
          <li 
            key={index}
            className="flex items-start gap-4 p-3 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                {activity.icon}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{activity.user}</p>
              <p className="text-gray-600 text-sm">{activity.action}</p>
              <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{activity.time}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
