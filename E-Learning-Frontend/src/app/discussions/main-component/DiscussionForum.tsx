import React, { useState, useEffect } from 'react';
import usePosts from '../hooks/usePosts';
import useCreatePost from '../hooks/useCreatePost';
import PostList from '../components/PostList';


interface DiscussionForumProps {
    courseId: string;
    userId: string;
    userRole: string;
    courseName: string;
  }

const DiscussionForum: React.FC<DiscussionForumProps> = ({ courseId, userId, userRole,courseName}) => {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const { posts, loading: postsLoading, error: postsError } = usePosts(courseId);
  const { handleCreatePost, error: postError } = useCreatePost();

  const handleSubmit = () => {
    if (courseId) {
      handleCreatePost(courseId, userId, newPostTitle, newPostContent);
    }
    setNewPostTitle('');
    setNewPostContent('');
  };

  if (postsLoading) return <p>Loading posts...</p>;
  if (postsError) return <p>{postsError}</p>;

  return (
    <div className="discussion-forum">
      <h1 className="text-3xl font-bold mb-4"> {courseName} Forum</h1>
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
      {posts && posts.length > 0 ? (
      <PostList posts={posts} userId={userId} userRole={userRole} />
      ) : (
      <p>No posts available for this course.</p>
      )}
    </div>
  );
};

export default DiscussionForum;