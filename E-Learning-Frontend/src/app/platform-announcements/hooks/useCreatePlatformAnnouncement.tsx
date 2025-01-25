import { useState, useEffect } from 'react';
import { platformAnnouncementSocket } from '../socket/sockets';

const useCreatePlatformAnnouncement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCreated = () => {
      setLoading(false);
    };

    const handleError = (response: any) => {
      setLoading(false);
      setError(response.message);
    };

    platformAnnouncementSocket.on('platform-announcement:created', handleCreated);
    platformAnnouncementSocket.on('platform-announcement:create:error', handleError);

    return () => {
      platformAnnouncementSocket.off('platform-announcement:created', handleCreated);
      platformAnnouncementSocket.off('platform-announcement:create:error', handleError);
    };
  }, []);

  const createAnnouncement = (content: string, admin: string) => {
    setLoading(true);
    setError(null);
    platformAnnouncementSocket.emit('platform-announcement:create', { content, admin });
  };

  return { createAnnouncement, loading, error };
};

export default useCreatePlatformAnnouncement;