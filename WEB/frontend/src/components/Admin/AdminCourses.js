import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import AdminQuizzes from './AdminQuizzes';

const AdminCourses = () => {
  const { db } = useFirebase();
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [newUnit, setNewUnit] = useState({
    title: '',
    imagePath: '',
    unitOrder: ''
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    vidOrder: '',
    videoURL: '',
    watched: false
  });

  useEffect(() => {
    fetchUnits();
  }, [db]);

  const fetchUnits = async () => {
    const unitsQuery = query(collection(db, 'units'), orderBy('unitOrder'));
    const snapshot = await getDocs(unitsQuery);
    const unitsData = await Promise.all(snapshot.docs.map(async doc => ({
      id: doc.id,
      ...doc.data(),
      quizzes: await getQuizzes(doc.id),
      videos: await getVideos(doc.id)
    })));
    setUnits(unitsData);
  };

  const getQuizzes = async (unitId) => {
    const snapshot = await getDocs(collection(db, 'units', unitId, 'quizzes'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const getVideos = async (unitId) => {
    const snapshot = await getDocs(collection(db, 'units', unitId, 'videos'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    const unitRef = doc(collection(db, 'units'));
    await setDoc(unitRef, {
      ...newUnit,
      unitOrder: Number(newUnit.unitOrder),
      createdAt: new Date().toISOString()
    });
    setIsAddingUnit(false);
    setNewUnit({ title: '', imagePath: '', unitOrder: '' });
    fetchUnits();
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;
    
    try {
      await addDoc(collection(db, 'units', selectedUnit.id, 'videos'), {
        ...newVideo,
        vidOrder: Number(newVideo.vidOrder),
        createdAt: new Date().toISOString()
      });
      
      setIsAddingVideo(false);
      setNewVideo({
        title: '',
        description: '',
        vidOrder: '',
        videoURL: '',
        watched: false
      });
      fetchUnits();
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    await deleteDoc(doc(db, 'units', unitId));
    fetchUnits();
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      newSet.has(unitId) ? newSet.delete(unitId) : newSet.add(unitId);
      return newSet;
    });
    setSelectedUnit(units.find(unit => unit.id === unitId));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Unit Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setIsAddingUnit(true)}
        >
          <Plus className="inline-block mr-1" /> Add Unit
        </button>
      </div>

      {units.map(unit => (
        <div key={unit.id} className="bg-white rounded-lg shadow mb-4">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button onClick={() => toggleUnit(unit.id)}>
                {expandedUnits.has(unit.id) ? <ChevronDown /> : <ChevronRight />}
              </button>
              <h3 className="font-semibold">{unit.title}</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDeleteUnit(unit.id)}>
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>

          {expandedUnits.has(unit.id) && (
            <div className="p-4 border-t">
              <AdminQuizzes unitId={unit.id} />

              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Videos</h4>
                  <button 
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => setIsAddingVideo(true)}
                  >
                    <Plus className="inline-block mr-1" /> Add Video
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {unit.videos.map(video => (
                    <div key={video.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">{video.title}</h5>
                          <p className="text-sm text-gray-600">{video.description}</p>
                          <p className="text-sm">Order: {video.vidOrder}</p>
                          <p className="text-sm">Watched: {video.watched ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      {video.videoURL && (
                        <div className="aspect-video">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${video.videoURL.split('v=')[1]}`}
                            title={video.title}
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Unit Modal */}
      {isAddingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsAddingUnit(false)}
            >
              <X />
            </button>
            <h3 className="text-xl font-semibold mb-4">Create New Unit</h3>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newUnit.title}
                  onChange={(e) => setNewUnit({ ...newUnit, title: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Image Path</label>
                <input
                  type="text"
                  value={newUnit.imagePath}
                  onChange={(e) => setNewUnit({ ...newUnit, imagePath: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Unit Order</label>
                <input
                  type="number"
                  value={newUnit.unitOrder}
                  onChange={(e) => setNewUnit({ ...newUnit, unitOrder: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Create Unit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {isAddingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsAddingVideo(false)}
            >
              <X />
            </button>
            <h3 className="text-xl font-semibold mb-4">Add New Video</h3>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Video Order</label>
                <input
                  type="number"
                  value={newVideo.vidOrder}
                  onChange={(e) => setNewVideo({ ...newVideo, vidOrder: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={newVideo.videoURL}
                  onChange={(e) => setNewVideo({ ...newVideo, videoURL: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newVideo.watched}
                  onChange={(e) => setNewVideo({ ...newVideo, watched: e.target.checked })}
                />
                <label className="font-medium">Watched</label>
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Add Video
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;