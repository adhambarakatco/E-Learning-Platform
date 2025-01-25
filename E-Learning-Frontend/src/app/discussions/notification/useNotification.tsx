// filepath: /c:/Users/aliia/OneDrive/Desktop/E-Learning-Frontend/src/app/discussions/notification/useNotification.tsx
import { useEffect, useState } from 'react';
import discussionsForumSocket from '../sockets/sockets';
import { NotificationData } from '@/app/platform-announcements/interfaces/notification';

const useNotification = (userId: string) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    // Join the user room to receive notifications
    discussionsForumSocket.emit('room:join:user', { id: userId });

    // Listen for notifications
    discussionsForumSocket.on('notification', (data: NotificationData) => {
      console.log('Received data:', data);
      setNotification(data);

      // Clear the notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    });

    // Cleanup function to leave the user room when component unmounts
    return () => {
      discussionsForumSocket.emit('room:leave:user', { id: userId });
      discussionsForumSocket.off('notification');
    };
  }, [userId]);

  return notification;
};

export default useNotification;