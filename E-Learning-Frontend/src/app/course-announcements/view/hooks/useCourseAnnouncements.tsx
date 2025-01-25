import { useState, useEffect } from 'react';
import courseAnnouncementSocket from '../../socket/sockets';
import { CourseAnnouncement } from '../../interfaces/acourse-announcement';

const useCourseAnnouncements = (courseId: string) => {
  const [announcements, setAnnouncements] = useState<CourseAnnouncement[]>([]);

  useEffect(() => {
    // Fetch initial announcements
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`http://localhost:3000/announcements/${courseId}`, {
          cache: "no-store",
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          
        });
        const result = await res.json();
        const data = result.data;
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();

    // Join the course room
    courseAnnouncementSocket.emit('room:join:course', { id: courseId });

    // Listen for real-time updates
    courseAnnouncementSocket.on('announcement:created', (newAnnouncement: CourseAnnouncement) => {
      setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
    });

    courseAnnouncementSocket.on('announcement:deleted', (deletedAnnouncement: CourseAnnouncement) => {
      setAnnouncements(prevAnnouncements => prevAnnouncements.filter(announcement => announcement._id !== deletedAnnouncement._id));
    });

    // Cleanup function to leave the room when component unmounts
    return () => {
      courseAnnouncementSocket.emit('room:leave:course', { id: courseId });
      courseAnnouncementSocket.off('announcement:created');
      courseAnnouncementSocket.off('announcement:deleted');
    };
  }, [courseId]);

  return announcements;
};

export default useCourseAnnouncements;