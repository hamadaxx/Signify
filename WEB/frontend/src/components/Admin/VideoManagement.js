import React, { useState } from 'react';
import { db } from '../firebase'; // Adjust the import based on your Firebase setup
import { collection, doc, setDoc } from 'firebase/firestore';

const VideoManagement = ({ unitId, courseId, lessonId }) => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoURL, setVideoURL] = useState('');
  const [vidOrder, setVidOrder] = useState(1);
  const [watched, setWatched] = useState(false);

  const handleAddVideo = async () => {
    try {
      const newVideo = {
        title: videoTitle,
        description: videoDescription,
        vidOrder,
        videoURL,
        watched,
      };

      const videoRef = doc(db, 'units', unitId, 'courses', courseId, 'lessons', lessonId, 'videos', videoTitle);
      await setDoc(videoRef, newVideo);
      console.log('Video added!');
    } catch (e) {
      console.error('Error adding video: ', e);
    }
  };

  return (
    <div>
      <h2>Add Video</h2>
      <input
        type="text"
        value={videoTitle}
        onChange={(e) => setVideoTitle(e.target.value)}
        placeholder="Video Title"
      />
      <input
        type="text"
        value={videoDescription}
        onChange={(e) => setVideoDescription(e.target.value)}
        placeholder="Video Description"
      />
      <input
        type="text"
        value={videoURL}
        onChange={(e) => setVideoURL(e.target.value)}
        placeholder="Video URL"
      />
      <input
        type="number"
        value={vidOrder}
        onChange={(e) => setVidOrder(Number(e.target.value))}
        placeholder="Video Order"
      />
      <label>
        Watched:
        <input
          type="checkbox"
          checked={watched}
          onChange={(e) => setWatched(e.target.checked)}
        />
      </label>
      <button onClick={handleAddVideo}>Add Video</button>
    </div>
  );
};

export default VideoManagement;
