import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useFirebase } from '../../context/FirebaseContext';
import { Bell, Moon, Sun, Mail, Globe, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserSettings = () => {
    const { currentUser, updateUserSettings } = useFirebase();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        darkMode: false,
        courseUpdates: true,
        achievementAlerts: true,
        language: 'en'
    });
    const [loading, setLoading] = useState(false);

    const fetchSettings = useCallback(async () => {
        if (!currentUser) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setSettings(userData.settings || settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    }, [currentUser, settings]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggle = async (setting) => {
        try {
            setLoading(true);
            const newSettings = { ...settings, [setting]: !settings[setting] };
            await updateUserSettings(newSettings);
            setSettings(newSettings);

            // Apply dark mode to the document
            if (setting === 'darkMode') {
                if (newSettings.darkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = async (e) => {
        try {
            setLoading(true);
            const newSettings = { ...settings, language: e.target.value };
            await updateUserSettings(newSettings);
            setSettings(newSettings);
            toast.success('Language preference updated');
        } catch (error) {
            console.error('Error updating language:', error);
            toast.error('Failed to update language preference');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

            <div className="space-y-6">
                {/* Notification Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Notifications</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                            </div>
                            <button
                                onClick={() => handleToggle('emailNotifications')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3151f9] focus:ring-offset-2 ${settings.emailNotifications ? 'bg-[#3151f9]' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                disabled={loading}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">Course Updates</span>
                            </div>
                            <button
                                onClick={() => handleToggle('courseUpdates')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3151f9] focus:ring-offset-2 ${settings.courseUpdates ? 'bg-[#3151f9]' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                disabled={loading}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.courseUpdates ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">Achievement Alerts</span>
                            </div>
                            <button
                                onClick={() => handleToggle('achievementAlerts')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3151f9] focus:ring-offset-2 ${settings.achievementAlerts ? 'bg-[#3151f9]' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                disabled={loading}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.achievementAlerts ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {settings.darkMode ? (
                                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            )}
                            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                        </div>
                        <button
                            onClick={() => handleToggle('darkMode')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3151f9] focus:ring-offset-2 ${settings.darkMode ? 'bg-[#3151f9]' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            disabled={loading}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Language</h2>
                    <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <select
                            value={settings.language}
                            onChange={handleLanguageChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#3151f9] focus:border-[#3151f9] sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            disabled={loading}
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings; 