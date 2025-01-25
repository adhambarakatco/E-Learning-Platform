"use client";
import React from 'react';
import useCourseAnnouncements from './hooks/useCourseAnnouncements';
import courseAnnouncementSocket from '../socket/sockets';

const ViewCourseAnnouncements = ({ courseId, userRole }: { courseId: string, userRole: string }) => {
  const announcements = useCourseAnnouncements(courseId);

  const handleDelete = (announcementId: string) => {
    courseAnnouncementSocket.emit('announcement:delete', announcementId);
  };

  return (
    <>
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
            {(userRole === 'instructor' || userRole === 'admin') && (
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

export default ViewCourseAnnouncements;