"use client";
import React from 'react';
import usePlatformAnnouncements from '../hooks/usePlatformAnnouncements';
import { platformAnnouncementSocket } from '../socket/sockets';

const ViewPlatformAnnouncements = ({ userRole }: { userRole: string }) => {
  const announcements = usePlatformAnnouncements();

  const handleDelete = (announcementId: string) => {
    platformAnnouncementSocket.emit('platform-announcement:delete', announcementId);
  };

  return (
    <>
      <h1>Platform Announcements</h1>
      <ul>
        {announcements.map(announcement => (
          <li key={announcement._id}>
            {announcement.content} - {new Date(announcement.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            {userRole === 'admin' && (
              <button onClick={() => handleDelete(announcement._id)} className="ml-4 text-red-500">
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default ViewPlatformAnnouncements;