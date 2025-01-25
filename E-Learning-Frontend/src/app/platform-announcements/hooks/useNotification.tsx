import { useEffect, useState } from 'react';
import { NotificationData } from '../interfaces/notification';
import { platformAnnouncementSocket } from '../socket/sockets';
const socket = platformAnnouncementSocket;

const useNotification = () => {
    const [notification, setNotification] = useState<NotificationData | null>(null);
  
    useEffect(() => {
      socket.on('notification', (data: NotificationData) => {
        ;
        setNotification(data);
      });
  
      return () => {
        socket.off('notification');
      };
    }, []);
  
    return notification;
  };
  
  export default useNotification;