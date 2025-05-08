import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/fbConfig';

// Function to clear a specific collection
export const clearCollection = async (collectionName) => {
  try {
    console.log(`Clearing collection: ${collectionName}`);
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    console.log(`Successfully cleared collection: ${collectionName}`);
  } catch (error) {
    console.error(`Error clearing collection ${collectionName}:`, error);
    throw error;
  }
};

// Function to clear all collections
export const clearAllCollections = async () => {
  try {
    // List of all collections in your database
    const collections = [
      'questions',
      'notifications',
      'users'
    ];

    console.log('Starting to clear all collections...');
    
    // Clear each collection
    const clearPromises = collections.map(collectionName => 
      clearCollection(collectionName)
    );
    
    await Promise.all(clearPromises);
    console.log('Successfully cleared all collections');
  } catch (error) {
    console.error('Error clearing all collections:', error);
    throw error;
  }
}; 