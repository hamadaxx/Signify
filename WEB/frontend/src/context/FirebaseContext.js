import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

const FirebaseContext = createContext();

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

export const FirebaseProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setCurrentUser({ 
                            ...user, 
                            ...userData,
                            progress: userData.progress || initProgressState()
                        });
                        setUserRole(userData.role || 'user');
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const initProgressState = () => ({
        completedLessons: [],
        completedQuizzes: [],
        completedUnits: [],
        points: 0,
        streak: 0,
        lastActive: new Date().toISOString(),
        lastLoginDate: new Date().toISOString()
    });

    const signup = async (email, password, firstName, lastName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: `${firstName} ${lastName}` });

            const userDoc = {
                email,
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`,
                role: 'user',
                createdAt: new Date().toISOString(),
                settings: { /*...*/ },
                progress: initProgressState()
            };

            await setDoc(doc(db, 'users', user.uid), userDoc);
            return user;
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setCurrentUser({ ...user, ...userData });
                setUserRole(userData.role || 'user');
                
                // Update last login
                await updateDoc(doc(db, 'users', user.uid), {
                    'progress.lastLoginDate': new Date().toISOString()
                });
            }
            return user;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const updateLessonProgress = async (lessonId, unitId) => {
        if (!currentUser) return;

        const lessonData = {
            id: lessonId,
            unitId,
            watched: true,
            completedAt: new Date().toISOString()
        };

        await updateDoc(doc(db, 'users', currentUser.uid), {
            'progress.completedLessons': arrayUnion(lessonData),
            'progress.points': increment(10),
            'progress.lastActive': new Date().toISOString()
        });
    };

    const value = {
        currentUser,
        userRole,
        loading,
        signup,
        login,
        logout: async () => {
            await signOut(auth);
            setCurrentUser(null);
            setUserRole(null);
        },
        updateLessonProgress,
        updateUserSettings: async (settings) => {
            await updateDoc(doc(db, 'users', currentUser.uid), { settings });
        }
    };

    return (
        <FirebaseContext.Provider value={value}>
            {!loading && children}
        </FirebaseContext.Provider>
    );
};

export default FirebaseContext;