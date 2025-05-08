import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Video, Plus, Trash2, X, FileVideo } from 'lucide-react';

const AdminLessons = ({ unitId, courseId }) => {
  const { db, storage } = useFirebase();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    order: 0,
    videoURL: ''
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    videoFile: null
  });

  useEffect(() => {
    if (unitId && courseId) fetchLessons();
  }, [unitId, courseId]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError('');
      const lessonsCollection = collection(db, 'units', unitId, 'courses', courseId, 'lessons');
      const snapshot = await getDocs(lessonsCollection);
      const lessonsData = await Promise.all(snapshot.docs.map(async doc => ({
        id: doc.id,
        ...doc.data(),
        videos: await getVideos(doc.id)
      })));
      setLessons(lessonsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Error fetching lessons: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getVideos = async (lessonId) => {
    try {
      const videosCollection = collection(db, 'units', unitId, 'courses', courseId, 'lessons', lessonId, 'videos');
      const snapshot = await getDocs(videosCollection);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  };

  const handleVideoUpload = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `lesson-videos/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!unitId || !courseId || !selectedLesson) return;

    try {
      setLoading(true);
      setError('');
      
      let videoURL = '';
      if (newVideo.videoFile) {
        videoURL = await handleVideoUpload(newVideo.videoFile);
      }

      await addDoc(collection(db, 'units', unitId, 'courses', courseId, 'lessons', selectedLesson.id, 'videos'), {
        title: newVideo.title,
        description: newVideo.description,
        videoURL,
        createdAt: new Date().toISOString()
      });

      setNewVideo({ title: '', description: '', videoFile: null });
      setIsAddingVideo(false);
      fetchLessons();
    } catch (error) {
      setError('Error adding video: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Add Video Modal */}
      {isAddingVideo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Video to {selectedLesson?.title}</h3>
              <button onClick={() => setIsAddingVideo(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Video Title</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Video File</label>
                <label className="mt-1 flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                  <div className="text-center">
                    <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {newVideo.videoFile ? newVideo.videoFile.name : 'Click to upload video'}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setNewVideo({ ...newVideo, videoFile: e.target.files[0] })}
                    className="hidden"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload Video
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">{lesson.title}</h4>
              <button
                onClick={() => {
                  setSelectedLesson(lesson);
                  setIsAddingVideo(true);
                }}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Video
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.videos?.map((video) => (
                <div key={video.id} className="bg-gray-50 p-4 rounded-lg">
                  <video controls className="w-full rounded-lg mb-2">
                    <source src={video.videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="flex justify-between items-center">
                    <div>
                      <h6 className="font-medium">{video.title}</h6>
                      <p className="text-sm text-gray-600">{video.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(lesson.id, video.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLessons;