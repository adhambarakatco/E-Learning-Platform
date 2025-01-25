import { useState, useEffect } from 'react';

interface Course {
  _id: string;
  name: string;
}

const useEnrolledCourses = (studentId: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseMap, setCourseMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await fetch(`http://localhost:3000/courses/enrolled/${studentId}`, { cache: "no-store" });
        const result = await res.json();
        setCourses(result);

        const map: { [key: string]: string } = {};
        result.forEach((course: Course) => {
          map[course._id] = course.name;
        });
        setCourseMap(map);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    };

    fetchEnrolledCourses();
  }, [studentId]);

  return { courses, courseMap };
};

export default useEnrolledCourses;