import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/fbConfig';
import { doc, getDoc, setDoc, updateDoc, increment, Timestamp, collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const BADGES = {
  BEGINNER: { name: 'Beginner', points: 100, icon: '🌱' },
  LEARNER: { name: 'Learner', points: 200, icon: '📚' },
  SKILLED: { name: 'Skilled', points: 400, icon: '🎯' },
  FLUENT: { name: 'Fluent', points: 700, icon: '🌟' },
  MASTER: { name: 'Master', points: 1500, icon: '👑' }
};

export const POINTS = {
  DAILY_LOGIN: 5,
  LESSON_COMPLETION: 5,
  UNIT_COMPLETION: 10,
  QUIZ_COMPLETION: 20
};

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBadge, setCurrentBadge] = useState(null);
  const [streak, setStreak] = useState(0);
  const [streakFreeze, setStreakFreeze] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    } else {
      setUserProgress(null);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (userProgress?.points) {
      const points = userProgress.points;
      if (points >= BADGES.MASTER.points) {
        setCurrentBadge(BADGES.MASTER);
      } else if (points >= BADGES.FLUENT.points) {
        setCurrentBadge(BADGES.FLUENT);
      } else if (points >= BADGES.SKILLED.points) {
        setCurrentBadge(BADGES.SKILLED);
      } else if (points >= BADGES.LEARNER.points) {
        setCurrentBadge(BADGES.LEARNER);
      } else if (points >= BADGES.BEGINNER.points) {
        setCurrentBadge(BADGES.BEGINNER);
      } else {
        setCurrentBadge(null);
      }
    }
  }, [userProgress]);

  const fetchUserProgress = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const initialProgress = {
          points: 0,
          completedLessons: [],
          completedUnits: [],
          streak: 0,
          lastLoginDate: null,
          streakFreeze: false,
          badges: [],
          completedQuizzes: []
        };
        
        await setDoc(userRef, {
          progress: initialProgress
        });
        
        setUserProgress(initialProgress);
        setStreak(0);
        setStreakFreeze(false);
        setLastLoginDate(null);
      } else {
        const userData = userDoc.data();
        const progress = userData.progress || {
          points: 0,
          completedLessons: [],
          completedUnits: [],
          streak: 0,
          lastLoginDate: null,
          streakFreeze: false,
          badges: [],
          completedQuizzes: []
        };
        
        setUserProgress(progress);
        setStreak(progress.streak || 0);
        setStreakFreeze(progress.streakFreeze || false);
        setLastLoginDate(progress.lastLoginDate?.toDate() || null);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardDailyLoginBonus = async () => {
    if (!user) return false;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastLogin = lastLoginDate ? new Date(lastLoginDate) : null;
      if (lastLogin) {
        lastLogin.setHours(0, 0, 0, 0);
      }
      
      if (lastLogin && lastLogin.getTime() === today.getTime()) {
        return false;
      }
      
      if (lastLogin) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin.getTime() === yesterday.getTime()) {
          await updateStreak(streak + 1);
        } else if (streakFreeze && lastLogin.getTime() === new Date(today.setDate(today.getDate() - 2)).getTime()) {
          await updateStreak(streak);
          setStreakFreeze(false);
        } else {
          await updateStreak(0);
        }
      } else {
        await updateStreak(1);
      }
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'progress.points': increment(POINTS.DAILY_LOGIN),
        'progress.lastLoginDate': Timestamp.now()
      });
      
      setUserProgress(prev => ({
        ...prev,
        points: prev.points + POINTS.DAILY_LOGIN
      }));
      
      setLastLoginDate(new Date());
      
      if (streak === 9) {
        await updateDoc(userRef, {
          'progress.streakFreeze': true
        });
        setStreakFreeze(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error awarding daily login bonus:', error);
      return false;
    }
  };

  const updateStreak = async (newStreak) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'progress.streak': newStreak
      });
      
      setStreak(newStreak);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const completeLesson = async (lessonId, unitId) => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('User document does not exist');
        return false;
      }
      
      const userData = userDoc.data();
      const progress = userData.progress || {};
      const completedLessons = progress.completedLessons || [];
      
      const alreadyCompleted = completedLessons.some(lesson => lesson.id === lessonId);
      
      if (!alreadyCompleted) {
        const newCompletedLesson = {
          id: lessonId,
          unitId,
          completedAt: Timestamp.now(),
          watched: true
        };
        
        await updateDoc(userRef, {
          'progress.completedLessons': [...completedLessons, newCompletedLesson],
          'progress.points': increment(POINTS.LESSON_COMPLETION)
        });
        
        setUserProgress(prev => ({
          ...prev,
          completedLessons: [...(prev?.completedLessons || []), newCompletedLesson],
          points: (prev?.points || 0) + POINTS.LESSON_COMPLETION
        }));
        
        await checkUnitCompletion(unitId);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error completing lesson:', error);
      return false;
    }
  };

  const checkUnitCompletion = async (unitId) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;
      
      const userData = userDoc.data();
      const progress = userData.progress || {};
      const completedLessons = progress.completedLessons || [];
      const completedUnits = progress.completedUnits || [];
      
      const lessonsRef = collection(db, 'units', unitId, 'videos');
      const lessonsSnapshot = await getDocs(lessonsRef);
      const totalLessons = lessonsSnapshot.size;
      
      const completedLessonsInUnit = completedLessons.filter(
        lesson => lesson.unitId === unitId
      ).length;
      
      if (completedLessonsInUnit === totalLessons && !completedUnits.includes(unitId)) {
        await updateDoc(userRef, {
          'progress.completedUnits': [...completedUnits, unitId],
          'progress.points': increment(POINTS.UNIT_COMPLETION)
        });
        
        setUserProgress(prev => ({
          ...prev,
          completedUnits: [...prev.completedUnits, unitId],
          points: (prev.points || 0) + POINTS.UNIT_COMPLETION
        }));
      }
    } catch (error) {
      console.error('Error checking unit completion:', error);
    }
  };

  const completeQuiz = async (unitId, score) => {
    if (!user) return false;
  
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        console.error('User document does not exist');
        return false;
      }
  
      const userData = userDoc.data();
      const progress = userData.progress || {};
      const completedQuizzes = progress.completedQuizzes || [];
  
      const existingQuizIndex = completedQuizzes.findIndex(quiz => quiz.unitId === unitId);
  
      if (existingQuizIndex === -1) {
        // First attempt
        completedQuizzes.push({
          unitId,
          previousScore: null,
          latestScore: score,
          completedAt: Timestamp.now()
        });
      } else {
        // Retake
        const previousLatestScore = completedQuizzes[existingQuizIndex].latestScore;
        completedQuizzes[existingQuizIndex] = {
          unitId,
          previousScore: previousLatestScore,
          latestScore: score,
          completedAt: Timestamp.now()
        };
      }
  
      await updateDoc(userRef, {
        'progress.completedQuizzes': completedQuizzes
      });
  
      setUserProgress(prev => ({
        ...prev,
        completedQuizzes: completedQuizzes
      }));
  
      return true;
    } catch (error) {
      console.error('Error completing quiz:', error);
      return false;
    }
  };
  


  const isLessonCompleted = (lessonId) => {
    if (!userProgress?.completedLessons) return false;
    return userProgress.completedLessons.some(lesson => lesson.id === lessonId);
  };

  const isUnitCompleted = (unitId) => {
    if (!userProgress?.completedUnits) return false;
    return userProgress.completedUnits.includes(unitId);
  };

  const isQuizCompleted = (unitId) => {
    if (!userProgress?.completedQuizzes) return false;
    return userProgress.completedQuizzes.some(quiz => quiz.unitId === unitId);
  };

  const getQuizScore = (unitId) => {
    if (!userProgress?.completedQuizzes) return null;
    const quiz = userProgress.completedQuizzes.find(quiz => quiz.unitId === unitId);
    return quiz ? quiz.previousScore : null;
  };

  const getUnitProgress = async (unitId) => {
    try {
      const videosRef = collection(db, 'units', unitId, 'videos');
      const videosSnapshot = await getDocs(videosRef);
      const totalVideos = videosSnapshot.size;
      
      if (totalVideos === 0) return 0;
      
      if (!userProgress?.completedLessons) {
        await fetchUserProgress();
      }
      
      const completedVideos = userProgress?.completedLessons?.filter(
        lesson => lesson.unitId === unitId
      ).length || 0;
      
      return (completedVideos / totalVideos) * 100;
    } catch (error) {
      console.error('Error calculating unit progress:', error);
      return 0;
    }
  };

  const refreshProgress = async () => {
    if (!user) return;
    await fetchUserProgress();
  };

  const value = {
    userProgress,
    loading,
    currentBadge,
    streak,
    streakFreeze,
    awardDailyLoginBonus,
    completeLesson,
    completeQuiz,
    isLessonCompleted,
    isQuizCompleted,
    getQuizScore,
    isUnitCompleted,
    getUnitProgress,
    refreshProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};