'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { Types } from 'mongoose';
import { Course } from "../types/Course";
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import StudentDetailsPage from "./StudentCourseDetails";
import fetcher from "../utils/fetcher";
import StudentProgressReport from "../progress/student/page";

// ALI ADDITION (IMPORTS)
////////////////////////////////////////////////////////////////////////
import DiscussionForum from "../discussions/main-component/DiscussionForum";
import CourseNotificationComponent from "../course-announcements/notification/component/NotificationComponent";
import ReplyNotificationComponent from "../discussions/notification/NotifcationComponent";
import ViewCourseAnnouncements from "../course-announcements/view/ViewCourseAnnouncements";
import { useRouter } from "next/navigation";
//////////////////////////////////////////////////////////////////////////

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  gpa: number;
  enrolledCourses: Types.ObjectId[];
  createdCourses: Types.ObjectId[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}



const StudentDashboard = () => {
  // ALI ADDITION (ACTIVE TABS)
  //////////////////////////////////////////////////////////////////////////
  const [activeTab, setActiveTab] = useState<'performance' | 'updateDetails' | 'searchCourse' | 'searchInstructor' | 'deleteUser' | 'forums' | 'chat' | 'myCourses'| 'courseDetails' | 'courseAnnouncements'>('performance');
  //////////////////////////////////////////////////////////////////////////
  const [userData, setUserData] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchCourses, setSearchCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newName, setNewName] = useState<string>('');
  const Router = useRouter();
  
  // ALI ADDITION (USE STATES)
  //////////////////////////////////////////////////////////////////////////
   // use state to select the forum course
   const [selectedForumCourse, setSelectedForumCourse] = useState<Course | null>(null);
   // use state to select the course for announcements
   const [selectedAnnouncementCourse, setSelectedAnnouncementCourse] = useState<Course | null>(null);
  //////////////////////////////////////////////////////////////////////////
   
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  

  const handleButtonClick = (tab: 'performance' | 'updateDetails' | 'searchCourse' | 'searchInstructor' | 'deleteUser' | 'forums' | 'chat' | 'myCourses' | 'courseAnnouncements') => {
    setActiveTab(tab);
  };

  const setUser = (newUser: User) => {
    setUserData(newUser);
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("http://localhost:3000/auth/userData", { withCredentials: true });
        setUserData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!userData) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:3000/courses/enrolled/${userData._id}`);
        setCourses(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [userData]);
  
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setActiveTab('courseDetails');
  };
  const handleBackButtonClick = () => {
    setSelectedCourse(null);
    setActiveTab('myCourses');
  };

  // ALI ADDITION
  //////////////////////////////////////////////////////////////////////////
  //Handle forum click
  const handleForumClick = (course: Course) => {
    setSelectedForumCourse(course);
    setActiveTab('forums');
  };

  //Handle course announcements click
  const handleAnnouncementClick = (course: Course) => {
    setSelectedAnnouncementCourse(course);
    setActiveTab('courseAnnouncements');
  };
  //////////////////////////////////////////////////////////////////////////
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();
    setSearchQuery(query);

    if (!query || activeTab !== 'searchCourse') return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3000/courses/searchByTitle`, {
        params: { title: query },
        withCredentials: true,
      });
      setSearchCourses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search courses.');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateName = async () => {
    if (!newName) {
      setError('Please enter a new name.');
      return;
    }

    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.put(
        'http://localhost:3000/users/editname',
        { name: newName },
        { withCredentials: true }
      );
      alert('Name updated successfully.');
      setNewName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
      window.location.href = '/'; 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
   
  const handleDeleteUser = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
  
    if (confirmed) {
      try {
        // Send DELETE request to `deletemyself` endpoint
        const response = await axios.delete('http://localhost:3000/users/deletemyself', {
          withCredentials: true, // Include cookies for authentication
        });
  
        if (response.status === 200) {
          // Logout after successful deletion
          await handleLogout();
        } else {
          console.error('Failed to delete account:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
   
  };

 
  return (
    <>
      <style>{`
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
    overflow-y: auto;  /* This makes the sidebar scrollable */
    padding-bottom: 50px;  /* To avoid the last button being stuck at the bottom */
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
    .delete-button {
          background-color: #d9534f;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }
        .delete-button:hover {
          background-color: #c9302c;
        }
`}</style>


      <div className="sidebar">
      {error && (
  <div style={{ color: 'red', marginTop: '20px' }}>
    <strong>Error:</strong> {error}
  </div>
)}
        <img src="/AA.png" alt="Logo" onClick={() => Router.push('/')} />

       
        {userData && (
          <div className="profile">
            <div className="profile-icon" role="img" aria-label="user-icon">
              <FaUserCircle />
            </div>
            <div className="profile-info">
              <div className="profile-name">{userData.name}</div>
              <div className="profile-email">{userData.email}</div>
            </div>
          </div>
        )}

        <div className="nav-item">
          <button onClick={() => handleButtonClick('performance')} className={activeTab === 'performance' ? 'active' : ''}>View Performance</button>
          <button onClick={() => handleButtonClick('updateDetails')} className={activeTab === 'updateDetails' ? 'active' : ''}>Update Details</button>
          <button onClick={() => handleButtonClick('searchCourse')} className={activeTab === 'searchCourse' ? 'active' : ''}>Search Courses</button>
          <button onClick={() => handleButtonClick('deleteUser')} className={activeTab === 'deleteUser' ? 'active' : ''}>Delete User</button>
          <button onClick={() => handleButtonClick('chat')} className={activeTab === 'chat' ? 'active' : ''}>Chat</button>
          <button onClick={() => handleButtonClick('myCourses')} className={activeTab === 'myCourses' ? 'active' : ''}>My Courses</button>
          {/* ALI ADDITION */}
          {/* START */}
          <button onClick={() => handleButtonClick('courseAnnouncements')} className={activeTab === 'courseAnnouncements' ? 'active' : ''}>Course Announcements</button>
          <button onClick={() => handleButtonClick('forums')} className={activeTab === 'forums' ? 'active' : ''}>Discussion Forums</button>
          {/* END */}

        </div>
      </div>

      <div className="content">
        <div className="details-container">
          <div className="back-button-container">
            <button onClick={() => setActiveTab('performance')} title="Back to Performance">
              <FaArrowLeft />
            </button>
          </div>

          {activeTab === 'performance' && (
            <div>
              <h1>Performance Tracking</h1>
              <StudentProgressReport />;
            </div>
          )}
         {activeTab === 'updateDetails' && (
  <div>
    <h1>Change Name</h1>
    {/* Input field for entering a new name */}
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="username" style={{ display: 'block', marginBottom: '10px' }}>
        Enter New Name:
      </label>
      <input
        type="text"
        id="username"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="New Name"
        style={{
          padding: '10px',
          width: '300px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '16px',
        }}
      />
    </div>
    {/* Update Name button */}
    <button
      style={{
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
      }}
      onClick={handleUpdateName}
    >
      Update Name
    </button>
  </div>
)}


        
        {activeTab === 'searchCourse' && (
  <div>
    <h1>Search for Courses</h1>
    <input
      type="text"
      placeholder="Search courses by title..."
      value={searchQuery}
      onChange={handleSearchChange}
      className="search-input"
    />
    <div className="course-container">
  {searchCourses.length === 0 && searchQuery.trim() === '' ? (
   
    <p></p>
  ) : (
    searchCourses.map((course) => (
      <div className="course-card" key={course._id}>
        <div className="course-title">{course.title}</div>
        <div className="course-description">{course.description}</div>
        <div className="course-keywords">{course.keywords.join(', ')}</div>
      </div>
    ))
  )}
</div>

  </div>
)}


         
          {activeTab === 'deleteUser' && (
            <div>
              <h1>Delete User</h1>
              <p>
                Warning: you are about to delete your account.
              </p>
              <button onClick={handleDeleteUser} className="delete-button">
                Delete My Account
              </button>
            </div>
          )}
          {/* ALI ADDITION (FORUMS) */}
          {activeTab === 'forums' && (
              <div>
                <h1>Discussion Forums</h1>
                {courses.length > 0 ? (
                  <div className="course-container">
                    {courses.map(course => (
                      <div
                        className="course-card"
                        key={course._id}
                        onClick={() => handleForumClick(course)} 
                      >
                        <div className="course-title">{course.title}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>You are not enrolled in any courses yet, enroll in a course to access its forum.</p>
                )}
                {selectedForumCourse && (
                  <DiscussionForum
                    courseId={selectedForumCourse._id}
                    userId={userData?._id || ''}
                    userRole={userData?.role || ''}
                    courseName={selectedForumCourse.title}

                  />
                )}
              </div>
            )}
            {/* END OF FORUMS */}
          {activeTab === 'chat' && (
            <div>
              <h1>Chat</h1>
              {/* Chat functionality */}
            </div>
          )}
            {activeTab === 'courseDetails' && selectedCourse && (
            <div className="course-details">
              <div className="back-button-container">
                <button onClick={handleBackButtonClick}>
                  <FaArrowLeft />
                  Back to My Courses
                </button>
              </div>
              <StudentDetailsPage course={selectedCourse} /> {/* Pass the selected course to the StudentDetailsPage */}
            </div>
          )}
          {activeTab === 'myCourses' && (
            <div>
              <h1>My Courses</h1>
              {courses.length > 0 ? (
                <div className="course-container">
                  {courses.map(course => (
                    <div
                      className="course-card"
                      key={course._id}
                      onClick={() => handleCourseClick(course)} 
                    >
                      <div className="course-title">{course.title}</div>
                      <div className="course-description">{course.description}</div>
                      <div className="course-keywords">{course.keywords.join(', ')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You are not enrolled in any courses yet.</p>
              )}
            </div>
          )}
          {/* ALI ADDITION (COURSE ANNOUNCEMENTS/NOTIFICATIONS) COPY AND PASTE TILL THE END OF THE FILE */}
          {activeTab === 'courseAnnouncements' && (
            <div>
              <h1>Course Announcements</h1>
              {courses.length > 0 ? (
                <div className="course-container">
                  {courses.map(course => (
                    <div
                      className="course-card"
                      key={course._id}
                      onClick={() => handleAnnouncementClick(course)} 
                    >
                      <div className="course-title">{course.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You are not enrolled in any courses yet, enroll in a course to view course announcements.</p>
              )}
              {selectedAnnouncementCourse && (
                <ViewCourseAnnouncements courseId={selectedAnnouncementCourse._id} userRole={userData?.role || ''} />
              )}
            </div>
          )}

        </div>
      </div>
      {userData && (
      <>
        <CourseNotificationComponent studentId={userData._id} />
        <ReplyNotificationComponent userId={userData._id} />
      </>
      )}
    </>
  );
}
export default StudentDashboard;
