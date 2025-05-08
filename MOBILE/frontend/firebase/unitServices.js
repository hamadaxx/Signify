import { doc, getDoc } from 'firebase/firestore';
import { db } from './fbConfig';

export const fetchUnitByTitle = async (unitTitle) => {
    try {
      const unitsRef = collection(db, 'units');
      const q = query(unitsRef, where('title', '==', unitTitle));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Unit not found');
      }
      
      // Return the first matching unit
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error("Error fetching unit:", error);
      throw error;
    }
  };