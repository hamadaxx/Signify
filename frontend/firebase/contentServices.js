import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  setDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './fbConfig';
import { auth } from './fbConfig';

// Get all units
export const getUnits = async () => {
  try {
    const unitsRef = collection(db, 'units');
    const q = query(unitsRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const units = [];
    querySnapshot.forEach((doc) => {
      units.push({ id: doc.id, ...doc.data() });
    });
    
    return units;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

// Get a specific unit
export const getUnit = async (unitId) => {
  try {
    const unitRef = doc(db, 'units', unitId);
    const unitDoc = await getDoc(unitRef);
    
    if (unitDoc.exists()) {
      return { id: unitDoc.id, ...unitDoc.data() };
    } else {
      throw new Error('Unit not found');
    }
  } catch (error) {
    console.error('Error fetching unit:', error);
    throw error;
  }
};

// Get lessons for a specific unit
export const getLessonsForUnit = async (unitId) => {
  try {
    const lessonsRef = collection(db, 'lessons');
    const q = query(
      lessonsRef, 
      where('unitId', '==', unitId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const lessons = [];
    querySnapshot.forEach((doc) => {
      lessons.push({ id: doc.id, ...doc.data() });
    });
    
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

// Get a specific lesson
export const getLesson = async (lessonId) => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonDoc = await getDoc(lessonRef);
    
    if (lessonDoc.exists()) {
      return { id: lessonDoc.id, ...lessonDoc.data() };
    } else {
      throw new Error('Lesson not found');
    }
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

// Get content items for a specific lesson
export const getContentItemsForLesson = async (lessonId) => {
  try {
    const contentItemsRef = collection(db, 'contentItems');
    const q = query(
      contentItemsRef, 
      where('lessonId', '==', lessonId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const contentItems = [];
    querySnapshot.forEach((doc) => {
      contentItems.push({ id: doc.id, ...doc.data() });
    });
    
    return contentItems;
  } catch (error) {
    console.error('Error fetching content items:', error);
    throw error;
  }
};

// Get a specific content item
export const getContentItem = async (contentItemId) => {
  try {
    const contentItemRef = doc(db, 'contentItems', contentItemId);
    const contentItemDoc = await getDoc(contentItemRef);
    
    if (contentItemDoc.exists()) {
      return { id: contentItemDoc.id, ...contentItemDoc.data() };
    } else {
      throw new Error('Content item not found');
    }
  } catch (error) {
    console.error('Error fetching content item:', error);
    throw error;
  }
};

// Get user progress
export const getUserProgress = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().progress || {
        completedUnits: [],
        completedLessons: [],
        completedContentItems: [],
        lastAccessedUnit: null,
        lastAccessedLesson: null
      };
    } else {
      // Initialize progress if it doesn't exist
      const initialProgress = {
        completedUnits: [],
        completedLessons: [],
        completedContentItems: [],
        lastAccessedUnit: null,
        lastAccessedLesson: null
      };
      
      await setDoc(userRef, {
        progress: initialProgress
      });
      return initialProgress;
    }
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

// Mark a content item as completed
export const markContentItemCompleted = async (contentItemId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'progress.completedContentItems': arrayUnion(contentItemId)
    });
    
    // Check if all content items in the lesson are completed
    const contentItem = await getContentItem(contentItemId);
    const lessonId = contentItem.lessonId;
    const contentItems = await getContentItemsForLesson(lessonId);
    
    // Get user progress once outside the loop to avoid multiple async calls
    const userProgress = await getUserProgress();
    
    const allCompleted = contentItems.every(item => 
      item.id === contentItemId || 
      userProgress.completedContentItems.includes(item.id)
    );
    
    if (allCompleted) {
      await markLessonCompleted(lessonId);
    }
    
    return true;
  } catch (error) {
    console.error('Error marking content item as completed:', error);
    throw error;
  }
};

// Mark a lesson as completed
export const markLessonCompleted = async (lessonId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'progress.completedLessons': arrayUnion(lessonId)
    });
    
    // Check if all lessons in the unit are completed
    const lesson = await getLesson(lessonId);
    const unitId = lesson.unitId;
    const lessons = await getLessonsForUnit(unitId);
    
    // Get user progress once outside the loop to avoid multiple async calls
    const userProgress = await getUserProgress();
    
    const allCompleted = lessons.every(item => 
      item.id === lessonId || 
      userProgress.completedLessons.includes(item.id)
    );
    
    if (allCompleted) {
      await markUnitCompleted(unitId);
    }
    
    return true;
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
};

// Mark a unit as completed
export const markUnitCompleted = async (unitId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'progress.completedUnits': arrayUnion(unitId)
    });
    
    return true;
  } catch (error) {
    console.error('Error marking unit as completed:', error);
    throw error;
  }
};

// Update last accessed unit and lesson
export const updateLastAccessed = async (unitId, lessonId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'progress.lastAccessedUnit': unitId,
      'progress.lastAccessedLesson': lessonId
    });
    
    return true;
  } catch (error) {
    console.error('Error updating last accessed:', error);
    throw error;
  }
}; 