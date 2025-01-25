"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Course } from "../../types/Course"; // Assuming you have a Course type
import CourseDetailsPage from "../Details/page";

const EnrolledCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
        if (!studentId) return; // Only fetch if studentId is set
    
        try {
          const response = await axios.get(`http://localhost:3000/courses/enrolled/${studentId}`);
          if (response.data && Array.isArray(response.data)) {
            setCourses(response.data);
          } else {
            setError('No courses found for this student.');
          }
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch enrolled courses. Please check the backend or try again later.');
          setLoading(false);
        }
      };

    fetchEnrolledCourses();
  }, [studentId]);

  const handleCardClick = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {selectedCourseId ? (
        <div>
          <button
            onClick={() => setSelectedCourseId(null)}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            &larr; Back to Enrolled Courses
          </button>
          <CourseDetailsPage courseIdInput={selectedCourseId} />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Enrolled Courses</h1>
          <div className="mb-4 text-center">
            <input
              type="text"
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Loading enrolled courses...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-600">No courses found for this student.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => handleCardClick(course._id)}
                  className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 cursor-pointer"
                >
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">{course.category || "Course"}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      <strong>Level:</strong> {course.level || "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      <strong>Instructor:</strong> {course.userId || "N/A"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      <strong>Created At:</strong> {course.created_at ? new Date(course.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnrolledCoursesPage;
