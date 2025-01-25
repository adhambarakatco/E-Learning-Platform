import { useState, useEffect } from 'react';
import { Course } from '../../../types/Course';
import courseAnnouncementSocket from '../../socket/sockets';

const useInstructorCourses = (instructorId: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:3001/courses/taught/by/${instructorId}`);
        const data = await res.json();
        setCourses(data);

        // Join rooms for all courses
        data.forEach((course: Course) => {
          courseAnnouncementSocket.emit('room:join:course', { id: course._id });
        });
      } catch (error) {
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Cleanup function to leave rooms when component unmounts
    return () => {
      courses.forEach((course: Course) => {
        courseAnnouncementSocket.emit('room:leave:course', { id: course._id });
      });
    };
  }, [instructorId]);

  return { courses, loading, error };
};

export default useInstructorCourses;