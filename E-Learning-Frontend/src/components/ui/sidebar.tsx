import { useState } from 'react';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'performance' | 'chat'>('courses'); // Define possible values for activeTab
  
  const handleButtonClick = (tab: 'courses' | 'performance' | 'chat') => { // Explicitly type the tab parameter
    setActiveTab(tab);
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
          background-color: white; /* Page background color */
          font-family: 'CustomFont', sans-serif;
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: flex-start; /* Align sidebar to the left */
          align-items: flex-start;
          overflow-x: hidden; /* Prevent horizontal scroll */
        }
        .sidebar {
          background-color: #31087b; /* Purple background color for sidebar */
          color: white;
          font-family: 'CustomFont';
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          width: 250px; /* Set a specific width for the sidebar */
          height: 100vh; /* Full height */
          padding-top: 20px; /* Add some padding from the top */
          position: fixed; /* Fix sidebar to the left */
          top: 0; /* Ensure it sticks to the top */
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
          margin-bottom: 40px; /* Give space below the logo */
          margin-left: -50px; /* Move the logo to the left with negative margin */
        }
        .logo img {
          width: 250px;
          height: 250px;
          display: block;
          margin: 0 auto; /* Center logo */
        }
        .content {
          margin-left: 250px; /* Ensure content does not overlap the sidebar */
          padding: 20px;
          width: calc(100% - 250px); /* Take up remaining space */
          overflow-x: hidden; /* Prevent horizontal scrolling in the content */
        }
      `}</style>
      <div className="sidebar">
        <div className="logo">
          <img
            src="/AA.png" // Replace with your logo file
            alt="Logo"
          />
        </div>
        <div className="nav flex-column">
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
              onClick={() => handleButtonClick('chat')}
              className={activeTab === 'chat' ? 'active' : ''}
            >
              Chatting
            </button>
          </div>
        </div>
      </div>

      {/* Render different content based on active tab */}
      <div className="content">
        {activeTab === 'courses' && <div>Manage Courses Content</div>}
        {activeTab === 'performance' && <div>Performance Tracking Content</div>}
        {activeTab === 'chat' && <div>Chatting Content</div>}
      </div>
    </>
  );
};

export default Sidebar;
