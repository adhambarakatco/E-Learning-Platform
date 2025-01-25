// filepath: /c:/Users/aliia/OneDrive/Desktop/E-Learning-Frontend/src/app/hooks/useNotification.tsx
import { useEffect, useState } from 'react';
import { NotificationData } from '@/app/platform-announcements/interfaces/notification';
import courseAnnouncementSocket from '../../socket/sockets';
import useEnrolledCourses from './useEnrolledCourses';

const useNotification = (studentId: string) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const { courseMap } = useEnrolledCourses(studentId);

  useEffect(() => {
    // Join rooms for enrolled courses
    Object.keys(courseMap).forEach(courseId => {
      courseAnnouncementSocket.emit('room:join:course', { id: courseId });
    });

    // Listen for notifications
    courseAnnouncementSocket.on('notification', (data: NotificationData) => {
      console.log('Received data:', data);
      setNotification(data);

      // Clear the notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    });

    // Cleanup function to leave rooms when component unmounts
    return () => {
      Object.keys(courseMap).forEach(courseId => {
        courseAnnouncementSocket.emit('room:leave:course', { id: courseId });
      });
      courseAnnouncementSocket.off('notification');
    };
  }, [courseMap]);

  return notification;
};

export default useNotification;