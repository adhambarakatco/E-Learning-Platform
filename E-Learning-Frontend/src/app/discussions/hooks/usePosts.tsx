"use client";

import { useState, useEffect } from 'react';
import { Post } from '../interfaces/post';
import discussionsForumSocket from '../sockets/sockets';

const usePosts = (courseId: string | undefined) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/discussions/posts/${courseId}`,{
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        setPosts(data.data);
      } catch (error) {
        setError('Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    discussionsForumSocket.emit('room:join:course', { id: courseId });

    discussionsForumSocket.on('post:created', (newPost: Post) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    discussionsForumSocket.on('post:deleted', (deletedPost: Post) => {
      setPosts((prevPosts) => prevPosts.filter(post => post._id !== deletedPost._id));
    });

    return () => {
      discussionsForumSocket.emit('room:leave:course', { id: courseId });
      discussionsForumSocket.off('post:created');
      discussionsForumSocket.off('post:deleted');
    };
  }, [courseId]);

  return { posts, loading, error };
};

export default usePosts;