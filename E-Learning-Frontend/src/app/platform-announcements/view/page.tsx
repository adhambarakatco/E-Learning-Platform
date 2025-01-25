"use client";
import React from 'react';
import ViewPlatformAnnouncements from './ViewPlatformAnnouncements';

const PlatformAnnouncementsPage = () => {
  const userRole = 'admin';

  return (
    <div>
      <ViewPlatformAnnouncements userRole={userRole} />
    </div>
  );
};

export default PlatformAnnouncementsPage;