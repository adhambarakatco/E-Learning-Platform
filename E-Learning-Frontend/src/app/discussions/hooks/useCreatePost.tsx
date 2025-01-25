"use client";

import { useState } from 'react';
import discussionsForumSocket from '../sockets/sockets';

const useCreatePost = () => {
  const [error, setError] = useState<string | null>(null);

  const handleCreatePost = (courseId: string, userId: string, title: string, content: string) => {
    if (title.trim() === '' || content.trim() === '') {
      setError('Title and content are required');
      return;
    }

    const payload = {
      title,
      content,
      course: courseId,
      author: userId,
    };

    discussionsForumSocket.emit('post:create', payload, (response: any) => {
      if (response.error) {
        setError(response.error);
      } else {
        setError(null);
      }
    });
  };

  return {
    handleCreatePost,
    error,
  };
};

export default useCreatePost;