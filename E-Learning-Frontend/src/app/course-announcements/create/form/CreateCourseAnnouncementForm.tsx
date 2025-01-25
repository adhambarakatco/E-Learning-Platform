import React, { useState } from 'react';
import useCreateCourseAnnouncement from '../hooks/useCreateCourseAnnouncement';

const CreateCourseAnnouncementForm = ({ instructorId, courseId }: { instructorId: string, courseId: string }) => {
  const [content, setContent] = useState('');
  const { createAnnouncement, loading, error } = useCreateCourseAnnouncement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAnnouncement(content, instructorId, courseId);
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
          style={{ display: 'block', width: '100%', marginBottom: '20px' }}
        />
      </div>
      <div style={{ marginTop: '40px' }}>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}>
          Create Announcement
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </form>
  );
};

export default CreateCourseAnnouncementForm;