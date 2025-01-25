'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaUserMinus } from 'react-icons/fa';
import { ObjectId } from 'mongoose';
import { useRouter } from 'next/navigation';
interface Log {
  _id: string;
  type: string;
  message: string;
  email?: string;
  endpoint?: string;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  students: string[];
  createdAt: string;
  isAvailable: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  gpa: number;
  enrolledCourses: string[];
  createdCourses: string[];
  createdAt: string;
  setActive: boolean;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'deleteUser' | 'deleteCourse' | 'users' | 'courses'>('logs');
  const [logs, setLogs] = useState<Log[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userIdToDelete, setUserIdToDelete] = useState<string>('');
  const [courseIdToDelete, setCourseIdToDelete] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [allUsers, setAllusers] = useState<User[] | null>(null);
  const [allCourses, setAllCourses] = useState<Course[] | null>(null);
  const Router = useRouter();


  const handleButtonClick = (tab: 'logs' | 'deleteUser' | 'deleteCourse' | 'users' | 'courses') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'courses') {
      fetchAllCourses();
    }
  };
 

  const setUser = (newUser: User) => {
    setUserData(newUser);
  };
  useEffect(() => {
    fetchLogs();
    
    //fetchAllUsers();
  }, []);
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchAllCourses();
    }
  }, [activeTab]);
  useEffect(() => { 
    if (activeTab === 'users') {
      fetchAllUsers();
    }
  }, [activeTab]);
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/users/allStudents', { withCredentials: true });
      setAllusers(response.data.data); // Assuming response structure is { data: [...] }
    } catch (error: any) {
      setError('Error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/courses/', { withCredentials: true });
      console.log(response.data)
      setAllCourses(response.data); // Assuming response structure is an array of courses
    } catch (error: any) {
      setError('Error fetching courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/logs', { withCredentials: true });
      setLogs(response.data);
    } catch (error: any) {
      setError('Error fetching logs');
      
    } finally {
      setLoading(false);
    }
  };
 const handleGet= async (userId:string) => { 
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/users', { withCredentials: true });
      setUsers(response.data);
    } catch (error: any) {
      //setError("Cant delete user");
     
    } finally {
      setLoading(false);
    }

  };
  const handleCheck = async (courseId: string) => { 
    setLoading(true);
    setError(null);
    try{
      const response = await axios.get('http://localhost:3000/courses/check', { withCredentials: true });
      setCourses(response.data);
    }catch(error:any){}
   finally {
    setLoading(false);
  }

};
  const handleDeleteUser = async () => {
    if (!userIdToDelete) {
      setError('Please enter a valid User ID.');
      setSuccess(null);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the user with ID: ${userIdToDelete}?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    handleGet(userIdToDelete);
    
    try {
      await axios.delete('http://localhost:3000/users/deleteuser', {
        withCredentials: true,
        data: { userId: userIdToDelete },
      });

      setUsers(users.filter((user) => user._id !== userIdToDelete));
      setUserIdToDelete('');
      setSuccess('User deleted successfully.');
    } catch (error: any) {
      setError("Can't delete user");
      setSuccess(null);
     
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteCourse = async () => {
    if (!courseIdToDelete) {
      setError('Please enter a valid Course ID.');
      setSuccess(null);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the course with ID: ${courseIdToDelete}?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    handleCheck(courseIdToDelete);

    try {
      await axios.delete("http://localhost:3000/courses/delete", {
        withCredentials: true,
        data: { courseId: courseIdToDelete },
      });

      setCourses(courses.filter((course) => course._id !== courseIdToDelete));
      setCourseIdToDelete('');
      setSuccess('Course deleted successfully.');
    } catch (error: any) {
      setError('Failed to delete the course');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };
  

  

  

  

  

  

  return (
    <>
      <style jsx>{`
        @font-face {
          font-family: 'CustomFont';
          src: url('/Bungee-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'CustomFont2';
          src: url('/Fredoka.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        body {
          background-color: white; 
          font-family: 'CustomFont', sans-serif;
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: flex-start; 
          align-items: flex-start;
          overflow-x: hidden; 
        }
        .sidebar {
          background-color: #31087b;
          color: white;
          font-family: 'CustomFont';
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          width: 250px;
          height: 100vh;
          padding-top: 20px;
          position: fixed;
          top: 0;
          z-index: 50;
        }
        .sidebar .nav-item {
          margin-bottom: 15px;
        }
        .sidebar button {
          background: transparent;
          color: white;
          border: none;
          padding: 12px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        .sidebar button:hover {
          background-color: #007bff;
        }
        .sidebar button.active {
          background-color: #007bff;
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
          margin-left: -50px;
          margin-top: -80px;
        }
        .logo img {
          width: 250px;
          height: 250px;
          display: block;
          margin: 0 auto;
        }
        .profile {
          padding: 10px;
          text-align: center;
          background-color: #400D97;
          margin-bottom: 20px;
          margin-top: -60px;
        }
        .profile .profile-icon {
            margin-top: -15px;
          font-size: 35px;
          color: white;
        }
        .profile .profile-info {
          margin-top: 0px;
          color: white;
          font-size: 12px;
        }
        .profile .profile-name {
          font-weight: bold;
          font-size: 16px;
        }
        .profile .profile-email {
          font-size: 12px;
          color: #bbb;
        }
        .content {
          margin-left: 250px; 
          padding: 20px;
          width: calc(100% - 250px); 
          overflow-x: hidden; 
        }

        .course-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .course-card {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .course-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .course-description {
          font-size: 14px;
          color: #555;
        }

        .course-keywords {
          margin-top: 10px;
          font-size: 12px;
          color: #777;
        }

        .search-input {
          margin-bottom: 20px;
          padding: 10px;
          width: 100%;
          font-size: 16px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .details-container {
          margin-left: 250px;
          min-height: 100vh;
          width: calc(100% - 250px);
          background-color: white;
        }

        .back-button-container {
          position: fixed;
          top: 20px;
          left: 270px;
          z-index: 40;
        }

        .student-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .student-card {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .student-name {
          font-size: 18px;
          font-weight: bold;
        }

        .student-email {
          font-size: 14px;
          color: #555;
        }

        .student-gpa {
          font-size: 14px;
          color: #777;
        }
          .logs-table-container {
  margin: 20px 0;
  overflow-x: auto; /* Ensures the table is scrollable on smaller screens */
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.logs-table th, 
.logs-table td {
  text-align: left;
  padding: 10px;
  border: 1px solid #ddd;
}

.logs-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.logs-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.logs-table tr:hover {
  background-color: #f1f1f1;
}

.logs-table td {
  word-wrap: break-word; /* Ensures long text wraps properly */
}

.logs-table-container {
  max-height: 400px; /* Optional: limit table height */
  overflow-y: auto; /* Optional: vertical scroll for long tables */
}
  .error-message {
    color: red;
    font-family: 'CustomFont';
    font-size: 16px;
    margin-top: 20px;
  }
    .success-message {
        color: green;
        font-family: 'CustomFont';
        font-size: 16px;
        margin-top: 20px;
      }
         table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background-color: white;
        }
        table th, table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        table th {
          background-color: #31087b;
          color: white;
          text-transform: uppercase;
        }
        table tr:nth-child(even) {
          background-color: #f4f4f4;
        }
        table tr:hover {
          background-color: #f1f1f1;
        }

      `}</style>
      <div className="background">
        <div className="sidebar">
        <img src="/AA.png" alt="Logo" onClick={() => Router.push('/')} />

          <button onClick={() => handleButtonClick('logs')}>Logs</button>
          <button onClick={() => handleButtonClick('deleteUser')}>Delete User</button>
          <button onClick={() => handleButtonClick('deleteCourse')}>Delete Course</button>
          <button onClick={() => handleButtonClick('users')}>Users</button>
        <button onClick={() => handleButtonClick('courses')}>Courses</button>
        <button
  style={{
    position: 'absolute', 
    bottom: '20px', 
    background: 'red', 
    color: 'white',
    border: 'none',
    padding: '12px',
    width: '90%', 
    margin: '0 auto', 
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '5px', 
  }}
  onClick={() => (window.location.href = 'http://localhost:3001')}
>
  Back to Home Page
</button>


         
        </div>
        <div className="dashboard-container" style={{ marginLeft: '250px' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'CustomFont' }}>
  Admin Dashboard
</h2>

          {error && <div className="error-message"><strong></strong> {error}</div>}
          {success && <div className="success-message">{success}</div>}
          {activeTab === 'logs' && (
  <div style={{ fontFamily: 'CustomFont', padding: '20px' }}>
    <h3 style={{ marginBottom: '20px', color: '#31087b' }}>Logs</h3>
    {logs.length > 0 ? (
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Message</th>
            <th>Email</th>
            <th>Endpoint</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: Log) => (
            <tr key={log._id}>
              <td>{log.type}</td>
              <td>{log.message}</td>
              <td>{log.email || 'N/A'}</td>
              <td>{log.endpoint || 'N/A'}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No logs available.</p>
    )}
  </div>
)}

{activeTab === 'deleteUser' && (
  <div style={{ fontFamily: 'CustomFont', padding: '20px' }}>
    <h3 style={{ marginBottom: '20px', color: '#31087b' }}>Delete Users</h3>
    {/* Input field for user ID */}
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor="userId"
        style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '16px',
          color: '#31087b',
        }}
      >
        Enter User ID:
      </label>
      <input
        type="text"
        id="userId"
        value={userIdToDelete}
        onChange={(e) => setUserIdToDelete(e.target.value)}
        placeholder="User ID"
        style={{
          padding: '10px',
          width: '300px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '16px',
          fontFamily: 'CustomFont',
        }}
      />
    </div>
    {/* Red delete button */}
    <button
      style={{
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontFamily: 'CustomFont2',
      }}
      onClick={handleDeleteUser}
    >
      Delete User
    </button>
    {/* List of users with delete icons */}
    <ul style={{ marginTop: '30px', listStyleType: 'none', padding: 0 }}>
      {users.map((user) => (
        <li
          key={user._id}
          style={{
            marginBottom: '10px',
            fontSize: '16px',
            fontFamily: 'CustomFont',
          }}
        >
          {user.name} ({user._id}){' '}
          <FaUserMinus
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={() => {
              setUserIdToDelete(user._id); // Prefill user ID
              handleDeleteUser(); // Trigger delete
            }}
          />
        </li>
      ))}
    </ul>
  </div>
)}

{activeTab === 'deleteCourse' && (
  <div style={{ fontFamily: 'CustomFont', padding: '20px' }}>
    <h3 style={{ marginBottom: '20px', color: '#31087b' }}>Delete Courses</h3>
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor="courseId"
        style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '16px',
          color: '#31087b',
        }}
      >
        Enter Course ID:
      </label>
      <input
        type="text"
        id="courseId"
        value={courseIdToDelete}
        onChange={(e) => setCourseIdToDelete(e.target.value)}
        placeholder="Course ID"
        style={{
          padding: '10px',
          width: '300px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '16px',
          fontFamily: 'CustomFont',
        }}
      />
    </div>
    <button
      style={{
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontFamily: 'CustomFont2',
      }}
      onClick={handleDeleteCourse}
    >
      Delete Course
    </button>
    <ul style={{ marginTop: '30px', listStyleType: 'none', padding: 0 }}>
      {courses.map((course) => (
        <li
          key={course._id}
          style={{
            marginBottom: '10px',
            fontSize: '16px',
            fontFamily: 'CustomFont',
          }}
        >
          {course.title} ({course._id}){' '}
          <FaTrash
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={() => {
              setCourseIdToDelete(course._id);
              handleDeleteCourse();
            }}
          />
        </li>
      ))}
    </ul>
  </div>
)}

{activeTab === 'users' && (
  <div style={{ fontFamily: 'CustomFont', padding: '20px' }}>
    <h3 style={{ marginBottom: '20px', color: '#31087b' }}>All Users</h3>
    {allUsers ? (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allUsers.map((user: User) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user._id}</td>
              <td style={{ color: user.setActive ? 'green' : 'red' }}>
                {user.setActive ? 'Active' : 'Deleted'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No users found.</p>
    )}
  </div>
)}

{activeTab === 'courses' && (
  <div style={{ fontFamily: 'CustomFont', padding: '20px' }}>
    <h3 style={{ marginBottom: '20px', color: '#31087b' }}>All Courses</h3>
    {allCourses ? (
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>ID</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {allCourses.map((course: Course) => (
            <tr key={course._id}>
              <td>{course.title}</td>
              <td>{course._id}</td>
              <td style={{ color: course.isAvailable ? 'green' : 'red' }}>
                {course.isAvailable ? 'Available' : 'Unavailable'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No courses found.</p>
    )}
  </div>
)}


        </div>
      </div>
    </>
  );
};


       
export default AdminDashboard;