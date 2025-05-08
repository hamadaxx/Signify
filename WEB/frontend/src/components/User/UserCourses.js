// src/pages/UserCourses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BookOpen, Video, CheckCircle2, Clock } from 'lucide-react';
import { useFirebase } from '../../context/FirebaseContext';

const UserCourses = () => {
  const { currentUser } = useFirebase();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const unitsQuery = query(collection(db, 'units'), orderBy('order', 'asc'));
      const unitsSnapshot = await getDocs(unitsQuery);

      const unitsData = await Promise.all(
        unitsSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();

          // Fetch courses for this unit
          const coursesQuery = query(
            collection(db, `units/${unitDoc.id}/courses`),
            orderBy('order', 'asc')
          );
          const coursesSnapshot = await getDocs(coursesQuery);

          const coursesData = await Promise.all(
            coursesSnapshot.docs.map(async (courseDoc) => {
              const courseData = courseDoc.data();

              // Fetch videos for this course
              const videosQuery = query(
                collection(db, `units/${unitDoc.id}/courses/${courseDoc.id}/videos`),
                orderBy('order', 'asc')
              );
              const videosSnapshot = await getDocs(videosQuery);

              const videosData = videosSnapshot.docs.map(videoDoc => ({
                id: videoDoc.id,
                ...videoDoc.data()
              }));

              return {
                id: courseDoc.id,
                ...courseData,
                videos: videosData
              };
            })
          );

          return {
            id: unitDoc.id,
            ...unitData,
            courses: coursesData
          };
        })
      );

      setUnits(unitsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching units:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const toggleUnit = (unitId) => {
    setExpandedUnit(expandedUnit === unitId ? null : unitId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3151f9]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={fetchUnits}
            className="mt-4 px-4 py-2 bg-[#3151f9] text-white rounded-lg hover:bg-[#f95e54] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
        {currentUser && (
          <p className="text-lg text-gray-600 mt-2">
            Welcome back, {currentUser.displayName || currentUser.email.split('@')[0]}! 👋
          </p>
        )}
      </div>

      <div className="space-y-6">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <button
              onClick={() => toggleUnit(unit.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[#3151f9]/10">
                  <BookOpen className="w-6 h-6 text-[#3151f9]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {unit.title}
                  </h2>
                  <p className="text-gray-600">{unit.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {unit.courses.length} courses
                </span>
                <div className="w-6 h-6 transform transition-transform">
                  {expandedUnit === unit.id ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            {expandedUnit === unit.id && (
              <div className="border-t border-gray-200">
                {unit.courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-[#f95e54]/10">
                        <Video className="w-6 h-6 text-[#f95e54]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800">
                          {course.title}
                        </h3>
                        <p className="text-gray-600">{course.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {course.videos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {video.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-800">
                              {video.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {video.duration} minutes
                            </p>
                          </div>
                          <button
                            className="px-4 py-2 bg-[#3151f9] text-white text-sm rounded-lg hover:bg-[#f95e54] transition-colors"
                            onClick={() => {
                              // Handle video playback
                              console.log('Play video:', video.id);
                            }}
                          >
                            {video.completed ? 'Review' : 'Start'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCourses;
