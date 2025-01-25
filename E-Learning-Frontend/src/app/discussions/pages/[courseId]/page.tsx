"use client";

import React, { useState, useEffect } from 'react';
import usePosts from '../../hooks/usePosts';
import useCreatePost from '../../hooks/useCreatePost';
import PostList from '../../components/PostList';

const DiscussionPage = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [resolvedParams, setResolvedParams] = useState<{ courseId: string } | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const userId = '64c19af2b5f1b20edc8a4884'; // Replace with actual user ID
  const userRole: string = 'instructor'; // Replace with actual user role

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { courseId } = resolvedParams || {};

  const { posts, loading: postsLoading, error: postsError } = usePosts(courseId || '');
  const { handleCreatePost, error: postError } = useCreatePost();

  const handleSubmit = () => {
    if (courseId) {
      handleCreatePost(courseId, userId, newPostTitle, newPostContent);
    }
    setNewPostTitle('');
    setNewPostContent('');
  };

  if (!resolvedParams || postsLoading) return <p>Loading posts...</p>;
  if (postsError) return <p>{postsError}</p>;

  return (
    <div className="discussion-forum">
      <h1 className="text-3xl font-bold mb-4">Discussion Forum</h1>
      {userRole !== 'admin' && (
        <div className="mb-4">
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Post title"
          />
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Write a new post..."
          />
          <button className="btn btn-primary" onClick={handleSubmit}>Post</button>
          {postError && <p className="text-red-500">{postError}</p>}
        </div>
      )}
      <PostList posts={posts} userId={userId} userRole={userRole} />
    </div>
  );
};

export default DiscussionPage;