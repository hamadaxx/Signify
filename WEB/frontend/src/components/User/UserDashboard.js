// EnhancedUserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useFirebase } from '../../context/FirebaseContext';
import { Book, Video, Play, CheckCircle2, Clock, ChevronRight, ChevronDown, Award, Star, Trophy, Target, Zap, Medal, Flame, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const UserDashboard = () => {
    const { currentUser } = useFirebase();
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedUnits, setExpandedUnits] = useState(new Set());
    const [expandedVideos, setExpandedVideos] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [badges, setBadges] = useState([
        { id: 1, name: 'First Steps', icon: Star, earned: false, description: 'Complete your first lesson', color: '#3151f9' },
        { id: 2, name: 'Unit Master', icon: Trophy, earned: false, description: 'Complete an entire unit', color: '#f95e54' },
        { id: 3, name: 'Quick Learner', icon: Zap, earned: false, description: 'Complete 5 lessons in one day', color: '#f9bd04' },
        { id: 4, name: 'SIGNIFY Expert', icon: Medal, earned: false, description: 'Complete all units', color: '#3151f9' },
        { id: 5, name: 'Streak Master', icon: Flame, earned: false, description: 'Maintain a 7-day streak', color: '#f95e54' }
    ]);

    useEffect(() => {
        const savedUnits = JSON.parse(localStorage.getItem('expandedUnits'));
        if (savedUnits) setExpandedUnits(new Set(savedUnits));
        fetchUnits();
        updateBadges();

        // Check for notifications permission
        if (currentUser?.settings?.courseUpdates || currentUser?.settings?.achievementAlerts) {
            Notification.requestPermission();
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('expandedUnits', JSON.stringify([...expandedUnits]));
    }, [expandedUnits]);

    const fetchUnits = async () => {
        try {
            const unitsSnapshot = await getDocs(collection(db, 'units'));
            const unitsData = await Promise.all(unitsSnapshot.docs.map(async (unitDoc) => {
                const unit = { id: unitDoc.id, ...unitDoc.data() };
                const videosSnapshot = await getDocs(collection(db, 'units', unitDoc.id, 'videos'));
                unit.videos = videosSnapshot.docs.map(videoDoc => {
                    const video = {
                        id: videoDoc.id,
                        ...videoDoc.data()
                    };
                    // Update watched status based on completedLessons
                    const completedLesson = currentUser?.completedLessons?.find(
                        lesson => lesson.id === videoDoc.id && lesson.unitId === unitDoc.id
                    );
                    video.watched = !!completedLesson;
                    return video;
                }).sort((a, b) => a.order - b.order);
                return unit;
            }));
            setUnits(unitsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching units:', error);
            setLoading(false);
        }
    };

    const updateBadges = () => {
        const totalVideos = units.reduce((acc, unit) => acc + unit.videos.length, 0);
        const completedVideos = currentUser?.completedLessons?.length || 0;
        const completedUnits = currentUser?.completedUnits?.length || 0;
        const currentStreak = currentUser?.streak || 0;

        setBadges(prevBadges => prevBadges.map(badge => {
            switch (badge.id) {
                case 1: // First Steps
                    return { ...badge, earned: completedVideos > 0 };
                case 2: // Unit Master
                    return { ...badge, earned: completedUnits > 0 };
                case 3: // Quick Learner
                    return { ...badge, earned: completedVideos >= 5 };
                case 4: // SIGNIFY Expert
                    return { ...badge, earned: completedUnits === units.length };
                case 5: // Streak Master
                    return { ...badge, earned: currentStreak >= 7 };
                default:
                    return badge;
            }
        }));
    };

    const toggleUnit = (unitId) => {
        const newExpanded = new Set(expandedUnits);
        newExpanded.has(unitId) ? newExpanded.delete(unitId) : newExpanded.add(unitId);
        setExpandedUnits(newExpanded);
    };

    const toggleVideo = (videoId) => {
        const newExpanded = new Set(expandedVideos);
        newExpanded.has(videoId) ? newExpanded.delete(videoId) : newExpanded.add(videoId);
        setExpandedVideos(newExpanded);
    };

    const showNotification = (title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    };

    const handleVideoClick = async (unitId, videoId) => {
        try {
            const videoRef = doc(db, 'units', unitId, 'videos', videoId);
            await updateDoc(videoRef, { watched: true });

            // Update local state
            setUnits(prevUnits => prevUnits.map(unit => {
                if (unit.id === unitId) {
                    return {
                        ...unit,
                        videos: unit.videos.map(video => {
                            if (video.id === videoId) {
                                return { ...video, watched: true };
                            }
                            return video;
                        })
                    };
                }
                return unit;
            }));

            // Show notification if enabled
            if (currentUser?.settings?.achievementAlerts) {
                showNotification('Lesson Completed', 'Great job! Keep learning!');
            }

            toast.success('Lesson marked as completed!');
        } catch (error) {
            console.error('Error updating video status:', error);
            toast.error('Failed to update lesson status');
        }
    };

    const filteredUnits = units.filter(unit => unit.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3151f9]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 dark:bg-gray-900">
            <div className="mb-8">
                <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0]}! 👋</h1>
                            <p className="mt-2 text-[#E0E7FF]">Continue your ASL learning journey</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full">
                            <User className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <StatCard label="Total Units" value={units.length} color="#3151f9" icon={<Book />} />
                    <StatCard label="In Progress" value={units.filter(u => u.progress > 0 && u.progress < 1).length} color="#f9bd04" icon={<Clock />} />
                    <StatCard label="Completed" value={units.filter(u => u.progress === 1).length} color="#f95e54" icon={<Award />} />
                    <StatCard label="Current Streak" value={`${currentUser?.streak || 0} days`} color="#f95e54" icon={<Flame />} />
                </div>
            </div>

            <input
                type="text"
                placeholder="Search units..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Achievements</h2>
                    <div className="text-sm text-gray-500">
                        {badges.filter(b => b.earned).length} of {badges.length} badges earned
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {badges.map((badge) => (
                        <motion.div
                            key={badge.id}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: badge.earned ? 1.1 : 1 }}
                            transition={{ duration: 0.4 }}
                            className={`p-4 rounded-lg flex items-center space-x-3 ${badge.earned
                                ? 'bg-gradient-to-br from-[#3151f9] to-[#f95e54] text-white'
                                : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            <div className="p-2 bg-white/20 rounded-lg">
                                <badge.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-medium">{badge.name}</h3>
                                <p className="text-sm opacity-80">{badge.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUnits.map((unit) => (
                    <motion.div
                        key={unit.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#3151f9] to-[#f95e54] flex items-center justify-center rounded-lg">
                                        <Book className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{unit.title}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-[#3151f9] to-[#f95e54] rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.round(unit.progress * 100)}%` }}
                                                    transition={{ duration: 0.8 }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(unit.progress * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => toggleUnit(unit.id)} className="text-gray-500 dark:text-gray-400">
                                    {expandedUnits.has(unit.id) ? <ChevronDown /> : <ChevronRight />}
                                </button>
                            </div>
                            {expandedUnits.has(unit.id) && (
                                <div className="mt-4 space-y-3">
                                    {unit.videos.map((video) => (
                                        <div
                                            key={video.id}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                                            onClick={() => toggleVideo(video.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-1 rounded-full">
                                                        {video.watched
                                                            ? <CheckCircle2 className="text-green-500" />
                                                            : <Clock className="text-[#f9bd04]" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{video.title}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Lesson {video.order}</p>
                                                    </div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleVideoClick(unit.id, video.id); }}>
                                                    <Play className="text-[#3151f9] hover:text-[#1e3a8a] dark:text-blue-400 dark:hover:text-blue-300" />
                                                </button>
                                            </div>
                                            {expandedVideos.has(video.id) && (
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 pl-8">{video.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color, icon }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4`} style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
            <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
                {icon}
            </div>
        </div>
    </div>
);

export default UserDashboard;