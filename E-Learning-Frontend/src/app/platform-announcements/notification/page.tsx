"use client";

import useNotification from '../hooks/useNotification';

const NotificationComponent = () => {
    const notification = useNotification();

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

export default NotificationComponent;