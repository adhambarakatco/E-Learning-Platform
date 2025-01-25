"use client";
import React from 'react';
import useNotification from '../hooks/useNotification';
import './NotificationComponent.css';

const CourseNotificationComponent = ({ studentId }: { studentId: string }) => {
  const notification = useNotification(studentId);

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

export default CourseNotificationComponent;