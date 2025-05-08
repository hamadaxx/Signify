// src/pages/UserProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  User,
  Mail,
  Calendar,
  Video,
  CheckCircle2,
  Clock,
  Award,
  Star,
  Trophy,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Flame
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const UserProfile = () => {
  const { currentUser, updateUserSettings } = useFirebase();
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    streak: 0,
    badges: 0
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    courseUpdates: true,
    achievementAlerts: true,
    language: 'en'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });

  const fetchUnits = useCallback(async () => {
    try {
      const unitsQuery = query(collection(db, 'units'), orderBy('order', 'asc'));
      const unitsSnapshot = await getDocs(unitsQuery);

      const unitsData = await Promise.all(
        unitsSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();

          // Fetch courses for this unit
          const coursesQuery = query(
            collection(db, `units/${unitDoc.id}/courses`),
            orderBy('order', 'asc')
          );
          const coursesSnapshot = await getDocs(coursesQuery);

          const coursesData = await Promise.all(
            coursesSnapshot.docs.map(async (courseDoc) => {
              const courseData = courseDoc.data();

              // Fetch videos for this course
              const videosQuery = query(
                collection(db, `units/${unitDoc.id}/courses/${courseDoc.id}/videos`),
                orderBy('order', 'asc')
              );
              const videosSnapshot = await getDocs(videosQuery);

              const videosData = videosSnapshot.docs.map(videoDoc => ({
                id: videoDoc.id,
                ...videoDoc.data()
              }));

              return {
                id: courseDoc.id,
                ...courseData,
                videos: videosData
              };
            })
          );

          return {
            id: unitDoc.id,
            ...unitData,
            courses: coursesData
          };
        })
      );

      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Fetch user's progress data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Calculate overall progress
        const totalLessons = units.reduce((total, unit) => {
          return total + unit.courses.reduce((courseTotal, course) => {
            return courseTotal + course.videos.length;
          }, 0);
        }, 0);

        const completedLessons = userData.progress?.completedLessons?.length || 0;
        const progressPercentage = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        setStats({
          totalLessons,
          completedLessons,
          streak: userData.progress?.streak || 0,
          badges: userData.progress?.badges?.length || 0,
          progressPercentage
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [currentUser, units]);

  useEffect(() => {
    if (currentUser) {
      fetchUnits();
    }
  }, [currentUser, fetchUnits]);

  useEffect(() => {
    if (currentUser && units.length > 0) {
      fetchUserData();
    }
  }, [currentUser, units, fetchUserData]);

  const handleSettingsChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (currentUser) {
      await updateUserSettings(newSettings);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-[#3151f9] rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <p className="text-gray-600">{currentUser?.email}</p>
            <p className="text-gray-500 text-sm mt-1">
              Member since {new Date(currentUser?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={Video}
          label="Total Lessons"
          value={stats.totalLessons}
          color="text-[#3151f9]"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Lessons"
          value={stats.completedLessons}
          color="text-[#f95e54]"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.streak} days`}
          color="text-[#f9bd04]"
        />
        <StatCard
          icon={Award}
          label="Badges Earned"
          value={stats.badges}
          color="text-[#3151f9]"
        />
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Learning Progress</h3>
        <div className="space-y-4">
          <ProgressBar
            label="Overall Progress"
            value={stats.progressPercentage}
            color="bg-[#3151f9]"
          />
          <ProgressBar
            label="Current Unit"
            value={75}
            color="bg-[#f95e54]"
          />
          <ProgressBar
            label="Weekly Goal"
            value={60}
            color="bg-[#f9bd04]"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-200 hover:scale-105">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const ProgressBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-800 font-medium">{Math.round(value)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${color}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

export default UserProfile;
