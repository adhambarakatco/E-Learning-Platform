"use client";

import { useState } from 'react';
import discussionsForumSocket from '../sockets/sockets';

const useCreateComment = () => {
  const [error, setError] = useState<string | null>(null);

  const handleCreateComment = (postId: string, userId: string, content: string) => {
    if (content.trim() === '') {
      setError('Content is required');
      return;
    }

    const payload = {
      content,
      post: postId,
      author: userId,
    };

    discussionsForumSocket.emit('comment:create', payload, (response: any) => {
      if (response.error) {
        setError(response.error);
      } else {
        setError(null);
      }
    });
  };

  return {
    handleCreateComment,
    error,
  };
};

export default useCreateComment;