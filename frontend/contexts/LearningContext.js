import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as contentServices from '../firebase/contentServices';

const LearningContext = createContext({});

export const LearningProvider = ({ children }) => {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [currentContentItem, setCurrentContentItem] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all units
  const fetchUnits = async () => {
    try {
      setLoading(true);
      const fetchedUnits = await contentServices.getUnits();
      setUnits(fetchedUnits);
      
      // If user has progress, set current unit to last accessed or first unit
      if (userProgress?.lastAccessedUnit) {
        const lastUnit = fetchedUnits.find(u => u.id === userProgress.lastAccessedUnit);
        if (lastUnit) {
          setCurrentUnit(lastUnit);
        } else {
          setCurrentUnit(fetchedUnits[0]);
        }
      } else if (fetchedUnits.length > 0) {
        setCurrentUnit(fetchedUnits[0]);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lessons for current unit
  const fetchLessons = async () => {
    if (!currentUnit) return;
    
    try {
      setLoading(true);
      const fetchedLessons = await contentServices.getLessonsForUnit(currentUnit.id);
      
      // If user has progress, set current lesson to last accessed or first lesson
      if (userProgress?.lastAccessedLesson && 
          fetchedLessons.some(l => l.id === userProgress.lastAccessedLesson)) {
        const lastLesson = fetchedLessons.find(l => l.id === userProgress.lastAccessedLesson);
        setCurrentLesson(lastLesson);
      } else if (fetchedLessons.length > 0) {
        setCurrentLesson(fetchedLessons[0]);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch content items for current lesson
  const fetchContentItems = async () => {
    if (!currentLesson) return;
    
    try {
      setLoading(true);
      const fetchedContentItems = await contentServices.getContentItemsForLesson(currentLesson.id);
      setContentItems(fetchedContentItems);
      
      if (fetchedContentItems.length > 0) {
        setCurrentContentItem(fetchedContentItems[0]);
      }
    } catch (error) {
      console.error('Error fetching content items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user progress
  const fetchUserProgress = async () => {
    if (!user) return;
    
    try {
      const progress = await contentServices.getUserProgress();
      setUserProgress(progress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  // Mark current content item as completed
  const markCurrentContentItemCompleted = async () => {
    if (!currentContentItem) return;
    
    try {
      await contentServices.markContentItemCompleted(currentContentItem.id);
      
      // Update local progress state
      setUserProgress(prev => ({
        ...prev,
        completedContentItems: [...prev.completedContentItems, currentContentItem.id]
      }));
      
      // Move to next content item if available
      const currentIndex = contentItems.findIndex(item => item.id === currentContentItem.id);
      if (currentIndex < contentItems.length - 1) {
        setCurrentContentItem(contentItems[currentIndex + 1]);
      }
      
      return true;
    } catch (error) {
      console.error('Error marking content item as completed:', error);
      return false;
    }
  };

  // Navigate to a specific unit
  const navigateToUnit = async (unitId) => {
    try {
      const unit = units.find(u => u.id === unitId);
      if (unit) {
        setCurrentUnit(unit);
        setCurrentLesson(null);
        setContentItems([]);
        setCurrentContentItem(null);
        
        // Update last accessed
        await contentServices.updateLastAccessed(unitId, null);
        
        // Fetch lessons for the new unit
        await fetchLessons();
      }
    } catch (error) {
      console.error('Error navigating to unit:', error);
    }
  };

  // Navigate to a specific lesson
  const navigateToLesson = async (lessonId) => {
    try {
      const lesson = await contentServices.getLesson(lessonId);
      if (lesson) {
        setCurrentLesson(lesson);
        setContentItems([]);
        setCurrentContentItem(null);
        
        // Update last accessed
        await contentServices.updateLastAccessed(currentUnit.id, lessonId);
        
        // Fetch content items for the new lesson
        await fetchContentItems();
      }
    } catch (error) {
      console.error('Error navigating to lesson:', error);
    }
  };

  // Navigate to a specific content item
  const navigateToContentItem = (contentItemId) => {
    const contentItem = contentItems.find(item => item.id === contentItemId);
    if (contentItem) {
      setCurrentContentItem(contentItem);
    }
  };

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchUnits();
    } else {
      setUnits([]);
      setCurrentUnit(null);
      setCurrentLesson(null);
      setContentItems([]);
      setCurrentContentItem(null);
      setUserProgress(null);
    }
  }, [user]);

  // Fetch lessons when current unit changes
  useEffect(() => {
    if (currentUnit) {
      fetchLessons();
    }
  }, [currentUnit]);

  // Fetch content items when current lesson changes
  useEffect(() => {
    if (currentLesson) {
      fetchContentItems();
    }
  }, [currentLesson]);

  const value = {
    units,
    currentUnit,
    currentLesson,
    contentItems,
    currentContentItem,
    userProgress,
    loading,
    navigateToUnit,
    navigateToLesson,
    navigateToContentItem,
    markCurrentContentItemCompleted,
    refreshUnits: fetchUnits,
    refreshLessons: fetchLessons,
    refreshContentItems: fetchContentItems,
    refreshProgress: fetchUserProgress
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  return useContext(LearningContext);
}; 