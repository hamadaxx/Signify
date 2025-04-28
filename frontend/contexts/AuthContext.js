import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChangedListener, signOutUser, signIn, signUp } from '../firebase/authServices';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/fbConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Update user profile in both context and Firestore
  const updateUserProfile = async (newData) => {
    try {
      if (!user?.uid) return;
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, newData);
      setUserProfile(prev => ({
        ...prev,
        ...newData
      }));
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      setUser(user);
      if (user?.uid) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async (email, password) => {
    try {
      setLoading(true);
      const user = await signIn(email, password);
      setUser(user);
      if (user?.uid) {
        await fetchUserProfile(user.uid);
      }
      return user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      const user = await signUp(email, password, firstName, lastName);
      setUser(user);
      if (user?.uid) {
        await fetchUserProfile(user.uid);
      }
      return user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      // Clear any stored data
      await AsyncStorage.clear();
      // Sign out from Firebase using the authServices function
      await signOutUser();
      // Clear the user state
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    updateUserProfile,
    refreshProfile: () => user?.uid && fetchUserProfile(user.uid),
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 