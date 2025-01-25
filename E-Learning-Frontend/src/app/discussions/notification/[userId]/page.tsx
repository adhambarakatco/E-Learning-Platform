"use client";
import React, { useState, useEffect } from 'react';
import NotificationComponent from '../NotifcationComponent';

const NotificationPage = ({ params }: { params: Promise<{ userId: string }> }) => {
  const [resolvedParams, setResolvedParams] = useState<{ userId: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return <p>Loading...</p>;
  }

  const { userId } = resolvedParams;

  return (
    <div>
      <h1>Notifications</h1>
      <NotificationComponent userId={userId} />
    </div>
  );
};

export default NotificationPage;