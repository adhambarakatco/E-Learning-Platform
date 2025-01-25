'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/userData", { withCredentials: true });
        if (response.data && response.data.role) {
          setRole(response.data.role);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error based on your requirement (e.g., redirect to login)
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  switch (role) {
    case 'instructor':
      return <InstructorDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Role Not Recognized</div>;
  }
};

export default Dashboard;
