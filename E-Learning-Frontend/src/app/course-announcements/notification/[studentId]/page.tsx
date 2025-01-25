"use client";
import React from 'react';
import NotificationComponent from '../component/NotificationComponent';

const NotificationPage = ({ params }: { params: Promise<{ studentId: string }> }) => {
  const [resolvedParams, setResolvedParams] = React.useState<{ studentId: string } | null>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return <p>Loading...</p>;
  }

  const { studentId } = resolvedParams;

  return (
    <div>
      <h1>Notifications</h1>
      <NotificationComponent studentId={studentId} />
    </div>
  );
};

export default NotificationPage;