"use client"

import React, { useState } from 'react';
import { Post } from '../interfaces/post';
import CommentList from './CommentList';
import useComments from '../hooks/useComments';
import useCreateComment from '../hooks/useCreateComment';
import discussionsForumSocket from '../sockets/sockets';

interface PostListProps {
  posts: Post[];
  userId: string;
  userRole: string;
}

const PostList: React.FC<PostListProps> = ({ posts, userId, userRole }) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handleToggleComments = (postId: string) => {
    setSelectedPostId(selectedPostId === postId ? null : postId);
  };

  const handleDeletePost = (postId: string) => {
    discussionsForumSocket.emit('post:delete', { postId: postId, role: userRole, userId: userId });
  };

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post._id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{post.title || 'Untitled Post'}</h2>
            <p>{post.content || 'No content available'}</p>
            {post.author ? (
              <p className="text-sm text-gray-500">By: {post.author.name} ({post.author.role})</p>
            ) : (
              <p className="text-sm text-gray-500">By: Unknown Author</p>
            )}
            <p className="text-sm text-gray-500">Posted on: {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown date'}</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={() => handleToggleComments(post._id)}>
                {selectedPostId === post._id ? 'Hide Comments' : 'Show Comments'}
              </button>
              {(userRole === 'admin' || (userRole === 'instructor' && post.author?.role === 'student' || post.author?._id === userId) || (userRole === 'student' && post.author?._id === userId)) && (
                <button className="btn btn-danger" onClick={() => handleDeletePost(post._id)}>Delete Post</button>
              )}
            </div>
            {selectedPostId === post._id && (
              <CommentsSection postId={post._id} userId={userId} userRole={userRole} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const CommentsSection: React.FC<{ postId: string; userId: string; userRole: string; }> = ({ postId, userId, userRole }) => {
  const { comments, loading, error } = useComments(postId);
  const { handleCreateComment, error: commentError } = useCreateComment();
  const [newCommentContent, setNewCommentContent] = useState('');

  const handleSubmit = () => {
    handleCreateComment(postId, userId, newCommentContent);
    setNewCommentContent('');
  };

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="mt-4">
      <CommentList comments={comments} userId={userId} userRole={userRole} />
      {userRole !== 'admin' && (
        <div className="mt-4">
          <textarea
            className="textarea textarea-bordered w-full"
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Write a new comment..."
          />
          <button className="btn btn-secondary mt-2" onClick={handleSubmit}>Comment</button>
          {commentError && <p className="text-red-500">{commentError}</p>}
        </div>
      )}
    </div>
  );
};

export default PostList;