import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './fbConfig';

export const fetchVideos = async (unitId) => {
  const videosRef = collection(db, 'units', unitId, 'videos');
  const snapshot = await getDocs(videosRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const fetchVideo = async (unitId, videoId) => {
  const videoRef = doc(db, 'units', unitId, 'videos', videoId);
  const videoSnap = await getDoc(videoRef);
  
  if (!videoSnap.exists()) {
    throw new Error('Video not found');
  }

  return {
    id: videoSnap.id,
    ...videoSnap.data()
  };
};