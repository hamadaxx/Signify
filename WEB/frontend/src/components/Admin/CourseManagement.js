import React, { useState, useEffect } from 'react';
import { db, storage } from '@/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';

const CourseManagement = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    videoLink: '',
    lessons: []
  });
  const [courseVideoFile, setCourseVideoFile] = useState(null);

  useEffect(() => { fetchUnits(); }, []);

  const fetchUnits = async () => {
    try {
      const unitsSnapshot = await getDocs(collection(db, 'units'));
      const unitsData = await Promise.all(
        unitsSnapshot.docs.map(async (unitDoc) => {
          const coursesSnapshot = await getDocs(
            collection(db, 'units', unitDoc.id, 'courses')
          );
          return {
            id: unitDoc.id,
            ...unitDoc.data(),
            courses: coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          };
        })
      );
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  /*const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    try {
      let videoLink = '';
      if (courseVideoFile) {
        const storageRef = ref(storage, `courses/${Date.now()}-${courseVideoFile.name}`);
        await uploadBytes(storageRef, courseVideoFile);
        videoLink = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'units', selectedUnit.id, 'courses'), {
        ...newCourse,
        videoLink,
        createdAt: new Date().toISOString()
      });
*/const handleAddCourse = async (e) => {
  e.preventDefault();
  if (!selectedUnit) return;

  try {
    let videoLink = '';
    if (courseVideoFile) {
      const storageRef = ref(storage, `courses/${Date.now()}-${courseVideoFile.name}`);
      await uploadBytes(storageRef, courseVideoFile);
      videoLink = await getDownloadURL(storageRef);
    }

    const courseData = {
      name: newCourse.name,
      description: newCourse.description,
      lessons: [], // Initialize empty lessons array
      createdAt: new Date().toISOString(), // Add timestamp
      ...(videoLink && { videoLink }) // Optional video link
    };

    await addDoc(
      collection(db, 'units', selectedUnit.id, 'courses'),
      courseData
    );

    // Reset form
    setIsAddingCourse(false);
    setNewCourse({
      name: '',
      description: '',
      lessons: [],
      videoLink: ''
    });
    setCourseVideoFile(null);
    fetchUnits();
  } catch (error) {
    console.error('Error adding course:', error);
  }
};
   

  const handleDeleteCourse = async (courseId) => {
    if (!selectedUnit) return;
    await deleteDoc(doc(db, 'units', selectedUnit.id, 'courses', courseId));
    fetchUnits();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Course Management</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Unit</label>
        <select
          onChange={(e) => {
            const unit = units.find(u => u.id === e.target.value);
            setSelectedUnit(unit);
            setIsAddingCourse(false);
          }}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select a Unit</option>
          {units.map(unit => (
            <option key={unit.id} value={unit.id}>
              {unit.title} (Order: {unit.unitOrder})
            </option>
          ))}
        </select>
      </div>

      {selectedUnit && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Courses in {selectedUnit.title}</h2>
            <Button onClick={() => setIsAddingCourse(true)}>Add Course</Button>
          </div>

          {selectedUnit.courses.map(course => (
            <div key={course.id} className="border rounded p-4 mb-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <p className="text-gray-700 mb-2">{course.description}</p>
              {course.videoLink && (
                <video controls className="w-full rounded-md mt-2">
                  <source src={course.videoLink} type="video/mp4" />
                </video>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDeleteCourse(course.id)}
                className="mt-3"
              >
                Delete
              </Button>
            </div>
          ))}

          {isAddingCourse && (
            <form onSubmit={handleAddCourse} className="mt-6 p-4 bg-gray-100 rounded shadow">
              <h3 className="text-lg font-bold mb-4">New Course</h3>
              <div className="space-y-4">
                <div>
                  <label>Course Name</label>
                  <input
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Description</label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Course Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setCourseVideoFile(e.target.files[0])}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsAddingCourse(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseManagement;