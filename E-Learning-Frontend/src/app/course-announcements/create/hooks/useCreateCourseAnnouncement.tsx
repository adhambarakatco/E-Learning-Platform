import { useState, useEffect } from 'react';
import courseAnnouncementSocket from '../../socket/sockets';

const useCreateCourseAnnouncement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCreated = () => {
      console.log('Announcement created');
      setLoading(false);
    };

    const handleError = (response: any) => {
      console.log('Error creating announcement:', response.message);
      setLoading(false);
      setError(response.message);
    };

    courseAnnouncementSocket.on('announcement:created', handleCreated);
    courseAnnouncementSocket.on('announcement:create:error', handleError);

    return () => {
      courseAnnouncementSocket.off('announcement:created', handleCreated);
      courseAnnouncementSocket.off('announcement:create:error', handleError);
    };
  }, []);

  const createAnnouncement = (content: string, instructor: string, course: string) => {
    console.log('Creating announcement...');
    setLoading(true);
    setError(null);
    courseAnnouncementSocket.emit('announcement:create', { content, instructor, course });
  };

  return { createAnnouncement, loading, error };
};

export default useCreateCourseAnnouncement;