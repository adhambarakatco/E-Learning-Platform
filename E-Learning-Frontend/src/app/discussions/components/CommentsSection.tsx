import CommentList from './CommentList';
import useComments from '../hooks/useComments';
import useCreateComment from '../hooks/useCreateComment';
import React, { useState } from 'react';


const CommentsSection: React.FC<{ postId: string; userId: string; userRole: string;}> = ({ postId, userId , userRole}) => {
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
      </div>
    );
  };
  