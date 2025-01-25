"use client";

import { useState, useEffect } from 'react';
import { Comment } from '../interfaces/comment';
import discussionsForumSocket from '../sockets/sockets';
import { headers } from 'next/headers';

const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:3000/discussions/comments/${postId}`,{
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        setComments(data.data);
      } catch (error) {
        setError('Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  useEffect(() => {
    discussionsForumSocket.emit('room:join:post', { id: postId });

    discussionsForumSocket.on('comment:created', (newComment: Comment) => {
      setComments((prevComments) => [newComment, ...prevComments]);
    });

    discussionsForumSocket.on('comment:deleted', (deletedComment: Comment) => {
      setComments((prevComments) => prevComments.filter(comment => comment._id !== deletedComment._id));
    });

    return () => {
      discussionsForumSocket.emit('room:leave:post', { id: postId });
      discussionsForumSocket.off('comment:created');
      discussionsForumSocket.off('comment:deleted');
    };
  }, [postId]);

  return { comments, loading, error };
};

export default useComments;