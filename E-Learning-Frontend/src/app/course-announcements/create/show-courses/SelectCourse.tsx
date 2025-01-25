"use client";
import React from 'react';
import useInstructorCourses from '../hooks/useInstructorCourses';
import { Course } from '../../../types/Course';

const SelectCourse = ({ instructorId, selectedCourse, onSelect }: { instructorId: string, selectedCourse: string, onSelect: (courseId: string) => void }) => {
  const { courses, loading, error } = useInstructorCourses(instructorId);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <label htmlFor="course">Select a Course:</label>
      <select id="course" value={selectedCourse} onChange={(e) => onSelect(e.target.value)}>
        <option value="">Select a course</option>
        {courses.map((course: Course) => (
          <option key={course._id} value={course._id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectCourse;