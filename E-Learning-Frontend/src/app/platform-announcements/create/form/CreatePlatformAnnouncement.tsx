"use client";
import React, { useState } from 'react';
import useCreatePlatformAnnouncement from '../../hooks/useCreatePlatformAnnouncement';

const CreatePlatformAnnouncementForm = () => {
  const [content, setContent] = useState('');
  const { createAnnouncement, loading, error } = useCreatePlatformAnnouncement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = '603d8f2f4d7a7e32bc8f1c6f'; // Replace with actual admin ID
    createAnnouncement(content, adminId);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="content">Announcement Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>Create Announcement</button>
      {error && <p>Error: {error}</p>}
    </form>
  );
};

export default CreatePlatformAnnouncementForm;