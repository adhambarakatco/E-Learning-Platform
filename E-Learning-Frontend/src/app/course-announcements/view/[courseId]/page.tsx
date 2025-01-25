"use client";
import React from 'react';
import ViewCourseAnnouncements from '../ViewCourseAnnouncements';

const CourseAnnouncementsPage = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [resolvedParams, setResolvedParams] = React.useState<{ courseId: string } | null>(null);
  const userRole = 'instructor'; // Replace with actual user role

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return <p>Loading...</p>;
  }

  const { courseId } = resolvedParams;

  return (
    <div>
      <h1>Course Announcements</h1>
      <ViewCourseAnnouncements courseId={courseId} userRole={userRole} />
    </div>
  );
};

export default CourseAnnouncementsPage;