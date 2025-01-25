'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { Types } from 'mongoose';
import { Course } from "../types/Course";
import InstructorDetailsPage from "./InstructorCourseDetails";
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import { Student } from "../types/student";
import {Instructor} from "../types/Course"
import { Module } from "../types/Module";
import InstructorProgressReport from '../progress/instructor/page'
import ViewCourseAnnouncements from "../course-announcements/view/ViewCourseAnnouncements";
import CreateCourseAnnouncementForm from "../course-announcements/create/form/CreateCourseAnnouncementForm";
import DiscussionForum from "../discussions/main-component/DiscussionForum";
import { useRouter } from "next/navigation";
import ReplyNotificationComponent from "../discussions/notification/NotifcationComponent";

const ISDP = ({ student }: { student: Student }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [red, setRed] = useState<boolean | null>(null);
  

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "80vh", width: "80vh" }}
    >
      <div className="card w-100" style={{ minWidth: "500px", minHeight: "400px" }}>
        <div className="card-body">
          <h6 className="card-subtitle mb-2 text-muted text-center">Student Details</h6>
          <p className="card-text">
            <strong>Name:</strong> {student.name}
          </p>
          <p className="card-text">
            <strong>Email:</strong> {student.email}
          </p>
          <p className="card-text">
            <strong>GPA:</strong> {student.gpa}
          </p>

          {student.courses && student.courses.length > 0 ? (
            <div>
              <h6 className="mt-4">Enrolled Courses:</h6>
              <ul className="list-group mt-2">
                {student.courses.map((course, index) => (
                  <li className="list-group-item" key={index}>
                    <strong>{course.title}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted mt-4">No courses enrolled.</p>
          )}
        </div>
      </div>
    </div>
  );
};


const IDP = ({ instructor }: { instructor: Instructor | null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [red, setRed] = useState<boolean | null>(null);

  // State to manage whether the name input is editable or not
  const [isEditable, setIsEditable] = useState(false);
  const [name, setName] = useState(instructor?.name || ''); // Local state for name

  // Function to toggle the name input between read-only and editable
  const handleEditClick = async () => {
    setIsEditable(!isEditable);
    if (isEditable) {
      try {
        const response = await axios.put(
          "http://localhost:3000/users/editname", 
          { name: name },  
          { withCredentials: true }
        );
        setMessage("Name Updated");
        setRed(false); 
      } catch (error: any) {
        setMessage(error.response?.data?.message || "Error updating name");
        setRed(true); 
      }
    }
  };

  // Handle name change when input is edited
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <div
      className="d-flex justify-content-end align-items-center"
      style={{ height: '80vh', width: '45vw' }}
    >
      <div className="card" style={{ minWidth: '300px', minHeight: '100px' }}>
        <div className="card-body">
          <h6 className="card-subtitle mb-2 text-muted text-center">Instructor Details</h6>

          <div>
            <strong>Name:</strong>
            <input
              className="form-control"
              type="text"
              value={name} // Bind the local state to the input value
              onChange={handleNameChange} // Update the name state on change
              placeholder="Edit name here..."
              readOnly={!isEditable} // Make it editable only when isEditable is true
            />

            <strong>Email:</strong>
            <div>{instructor?.email}</div> {/* Display email without editing option */}
          </div>

          {/* Edit button */}
          <div className="text-center mt-3">
            <button
              className="btn btn-primary"
              onClick={handleEditClick} // Toggle the editable state
            >
              {isEditable ? 'Save Info' : 'Edit Info'} {/* Change button text based on isEditable */}
            </button>
          </div>

          {/* Alert box for message */}
          {message && (
            <div
              className={`alert mt-3 ${red ? 'alert-danger' : 'alert-success'}`}
              role="alert"
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





const Dashboard = () => {
  //changed
  const [activeTab, setActiveTab] = useState<'user info' | 'courses' | 'performance' | 'chat' | 'forums' | 'students' | 'createAnnouncement' | 'viewAnnouncements'>('courses');
  const [selectedForumCourse, setSelectedForumCourse] = useState<Course | null>(null);
  const [selectedAnnouncementCourse, setSelectedAnnouncementCourse] = useState<Course | null>(null);
  const [selectedViewAnnouncementCourse, setSelectedViewAnnouncementCourse] = useState<Course | null>(null);
  const [userData, setUserData] = useState<Instructor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchCourses, setSearchCourses] = useState<Course[]>([]);
  const [searchStudents, setSearchStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const Router=useRouter();


  const handleCardClick = (course: Course) => setSelectedCourse(course);

  const handleStudentCardClick = (student: Student) => setSelectedStudent(student);


  const handleButtonClick = (tab: 'user info' | 'courses' | 'performance' | 'chat' | 'forums' | 'students' | 'createAnnouncement' | 'viewAnnouncements') => {
    setActiveTab(tab);
  };

  const handleForumClick = (course: Course) => {
    setSelectedForumCourse(course);
    setActiveTab('forums');
  };
  
  const handleAnnouncementClick = (course: Course) => {
    setSelectedAnnouncementCourse(course);
    setActiveTab('createAnnouncement');
  };
  
  const handleViewAnnouncementClick = (course: Course) => {
    setSelectedViewAnnouncementCourse(course);
    setActiveTab('viewAnnouncements');
  };

  const setUser = (newUser: Instructor) => {
    setUserData(newUser);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/userData", { withCredentials: true });
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error: unknown) {
        if(error instanceof Error)
        {
          console.log(error.message);
      }
    };
  }

    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:3000/courses/mycourses", { withCredentials: true });
        setCourses(response.data);
        setSearchCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:3000/users/students", { withCredentials: true });
        setStudents(response.data);
        setSearchStudents(response.data)
      } catch (err) {
        console.error('Failed to fetch students', err);
      }
    };

    fetchData();
    fetchCourses();
    fetchStudents();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (activeTab === 'courses') {
      const filteredCourses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.keywords.some((keyword) => keyword.toLowerCase().includes(query))
      );
      setSearchCourses(filteredCourses);

    } else if (activeTab === 'students') {
      const filteredStudents = students.filter(
        (student) =>
          student.name.toLowerCase().includes(query)
      );
      setSearchStudents(filteredStudents);
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
        .create-course-btn {
          padding: 10px 16px;
          font-size: 16px;
          font-family: 'CustomFont2', sans-serif;
          color: white;
          background-color: #31087b;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
      `}</style>
      <div className="sidebar">
        <img src="/AA.png" alt="Logo" onClick={() => Router.push('/')} />
        
        {userData && (
          <div className="profile">
            <div className="profile-icon">
              <FaUserCircle />
            </div>
            <div className="profile-info">
              <div className="profile-name">{userData.name}</div>
              <div className="profile-email">{userData.email}</div>
            </div>
          </div>
        )}
        <div className="nav flex-column">
        <div className="nav-item">
            <button
              onClick={() => handleButtonClick('user info')}
              className={activeTab === 'user info' ? 'active' : ''}
            >
              User info
            </button>
          </div>

          <div className="nav-item">
            <button
              onClick={() => handleButtonClick('courses')}
              className={activeTab === 'courses' ? 'active' : ''}
            >
              Manage Courses
            </button>
          </div>
          <div className="nav-item">
            <button
              onClick={() => handleButtonClick('performance')}
              className={activeTab === 'performance' ? 'active' : ''}
            >
              Performance Tracking
            </button>
          </div>
        
          <div className="nav-item">
            <button
              onClick={() => handleButtonClick('students')}
              className={activeTab === 'students' ? 'active' : ''}
            >
              Students
            </button>
          </div>
          <div className="nav-item">
            <button
              onClick={() => handleButtonClick('chat')}
              className={activeTab === 'chat' ? 'active' : ''}
            >
              Chats
            </button>
          </div>
          <div className="nav-item">
            <button
              onClick={() => handleButtonClick('forums')}
              className={activeTab === 'forums' ? 'active' : ''}
            >
              Discussion Forums
            </button>
          </div>         
          <div className="nav-item">
            <button
              onClick={() => handleButtonClick('createAnnouncement')}
              className={activeTab === 'createAnnouncement' ? 'active' : ''}
            >
              Create Announcement
            </button>
            </div>
            <div className="nav-item">
            <button
              onClick={() => handleButtonClick('viewAnnouncements')}
              className={activeTab === 'viewAnnouncements' ? 'active' : ''}
            >
              View Announcements
            </button>
            </div>
        </div>
      </div>
      
      {selectedCourse ? (
        <div className="details-container">
          <div className="back-button-container">
            <button
              onClick={() => setSelectedCourse(null)}
              className="flex items-center text-indigo-600 hover:text-indigo-800 space-x-2 transition-colors duration-300 bg-white px-4 py-2 rounded-lg shadow-md"
            >
              <FaArrowLeft className="mr-2" />
              <span>Back to All Courses</span>
            </button>
          </div>
          <InstructorDetailsPage course={selectedCourse} />
        </div>
      ) : (
        <div className="content">
          {activeTab === 'courses' && (
           <>
           <input
             type="text"
             className="search-input"
             value={searchQuery}
             onChange={handleSearchChange}
             placeholder="Search courses..."
           />
           <button
             onClick={() => window.location.href = '/Courses/Create'}
             className="create-course-btn ml-4"
           >
             Create Course
           </button>
           <div className="course-container">
             {searchCourses.map((course) => (
               <div key={course._id} onClick={() => handleCardClick(course)} className="course-card">
                 <div className="course-title">{course.title}</div>
                 <div className="course-version">Version: {course.versionNumber}</div>
               </div>
             ))}
           </div>
         </>
          )}
          {activeTab === 'performance' && (
                      <div>
                        <h1>Performance Tracking</h1>
                        <InstructorProgressReport />;
                      </div>
          )}

{activeTab === 'user info' && (
  <>
    <div className="back-button-container">
      <button
       onClick={() => handleButtonClick('courses')}  // Assuming setSelectedStudent is used to clear the selected student
        className="flex items-center text-indigo-600 hover:text-indigo-800 space-x-2 transition-colors duration-300 bg-white px-4 py-2 rounded-lg shadow-md"
      >
        <FaArrowLeft className="mr-2" />
        <span>Back to Dashboard</span>
      </button>
    </div>

    {/* Your component for user info */}
    <IDP instructor={userData} />
  </>
)}
          
          {activeTab === 'students' && (
  <>
    {selectedStudent ? (
      <div className="details-container">
        <div className="back-button-container">
          <button
            onClick={() => setSelectedStudent(null)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 space-x-2 transition-colors duration-300 bg-white px-4 py-2 rounded-lg shadow-md"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to All Students</span>
          </button>
        </div>
        <ISDP student={selectedStudent} />
      </div>
    ) : (
      <>
        <input
          type="text"
          className="search-input"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search students..."
        />
        <div className="student-container">
          {searchStudents.map((student) => (
            <div
              key={student._id}
              onClick={() => handleStudentCardClick(student)}
              className="student-card"
            >
              <div className="student-name">{student.name}</div>
              <div className="student-email">{student.email}</div>
              <div className="student-gpa">GPA: {student.gpa}</div>
            </div>
          ))}
        </div>
      </>
    )}
  </>
)}

{activeTab === 'createAnnouncement' && (
  <div>
    <h1>Create Course Announcement</h1>
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
      <p>You have not created any courses yet, create a course to make announcements.</p>
    )}
    {selectedAnnouncementCourse && userData && (
      <CreateCourseAnnouncementForm instructorId={userData._id} courseId={selectedAnnouncementCourse._id} />
    )}
       </div>
      )}

{activeTab === 'viewAnnouncements' && (
  <div>
    <h1>View Course Announcements</h1>
    {courses.length > 0 ? (
      <div className="course-container">
        {courses.map(course => (
          <div
            className="course-card"
            key={course._id}
            onClick={() => handleViewAnnouncementClick(course)} 
          >
            <div className="course-title">{course.title}</div>
          </div>
        ))}
      </div>
    ) : (
      <p>You have not created any courses yet, create a course to view announcements.</p>
    )}
    {selectedViewAnnouncementCourse && (
      <ViewCourseAnnouncements courseId={selectedViewAnnouncementCourse._id} userRole={userData?.role || ''} />
    )}
  </div>
)}
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
                  <p>You have not created any courses yet, create a course to access its forum.</p>
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
        </div>
      )}
     {userData && (
      <ReplyNotificationComponent userId={userData._id} />
     )}
    </>
  );
};

export default Dashboard;

