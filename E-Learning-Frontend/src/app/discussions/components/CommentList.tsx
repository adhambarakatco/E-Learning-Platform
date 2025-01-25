import React from 'react';
import { Comment } from '../interfaces/comment';
import discussionsForumSocket from '../sockets/sockets';

interface CommentListProps {
  comments: Comment[];
  userId: string;
  userRole: string;
}

const CommentList: React.FC<CommentListProps> = ({ comments, userId, userRole }) => {
  const handleDeleteComment = (commentId: string) => {
    discussionsForumSocket.emit('comment:delete', { commentId, role: userRole, userId });
  };

  return (
    <div className="space-y-2">
      {comments && comments.map(comment => (
        <div key={comment._id} className="card bg-base-200 shadow-md">
          <div className="card-body">
            <p>{comment.content}</p>
            <p className="text-sm text-gray-500">By: {comment.author.name} ({comment.author.role})</p>
            <p className="text-sm text-gray-500">Posted on: {new Date(comment.createdAt).toLocaleString()}</p>
            {(userRole === 'admin' || (userRole === 'instructor' && comment.author.role === 'student' || comment.author._id === userId) || (userRole === 'student' && comment.author._id === userId)) && (
              <button className="btn btn-danger" onClick={() => handleDeleteComment(comment._id)}>Delete Comment</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;