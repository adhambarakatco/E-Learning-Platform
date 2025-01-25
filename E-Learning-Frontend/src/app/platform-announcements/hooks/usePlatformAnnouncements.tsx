import { useEffect, useState } from 'react';
import { Announcement } from '../interfaces/announcement';
import { platformAnnouncementSocket } from '../socket/sockets';

const socket = platformAnnouncementSocket;

const usePlatformAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Fetch initial announcements
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('http://localhost:3001/platform-announcements', { cache: "no-store" });
        const data = await res.json();
        ;
        setAnnouncements(data.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();

    // Listen for real-time updates
    socket.on('platform-announcement:created', (newAnnouncement: Announcement) => {
      setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
    });

    socket.on('platform-announcement:deleted', (deletedAnnouncement: Announcement) => {
      setAnnouncements(prevAnnouncements => prevAnnouncements.filter(announcement => announcement._id !== deletedAnnouncement._id));
    });

    return () => {
      socket.off('platform-announcement:created');
      socket.off('platform-announcement:deleted');
    };
  }, []);

  return announcements;
};

export default usePlatformAnnouncements;