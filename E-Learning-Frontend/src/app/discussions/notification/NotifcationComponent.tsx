"use client";
import React from 'react';
import useNotification from './useNotification';


const ReplyNotificationComponent = ({ userId }: { userId: string }) => {
  const notification = useNotification(userId);

  return (
    <div>
      {notification && (
        <div className="notification-popup">
          <h2>{notification.message}</h2>
          <p>{notification.data}</p>
        </div>
      )}
    </div>
  );
};

export default ReplyNotificationComponent;