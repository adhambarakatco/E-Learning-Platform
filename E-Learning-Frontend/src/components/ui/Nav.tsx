import Image from 'next/image';
import { useRouter } from "next/navigation";
import React from "react";
import UserMenu from './UserMenu';
interface NavBarProps {
  name:string
  role: string
  
}
const NavBar: React.FC<NavBarProps> = ({ role , name }) =>  {
  const router = useRouter();
  const loginRoute = () => {
    router.push(`/login`); // Replace with your desired route
  };
  const registerRoute = () => {
    router.push(`/register`); // Replace with your desired route
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
          font-family: 'CustomFont', sans-serif;
          background-color: #31087b;
          margin: 0;
        }
        .navbar {
          background-color: #31087b; /* Navbar background color */
          position: fixed; /* Fix navbar to top */
          top: 0;
          left: 0;
          width: 100%; /* Full width */
          z-index: 1000; /* Stay on top */
          display: flex;
          justify-content: space-between;
          align-items: center; /* Center content vertically */
          padding: 5px 20px; /* Adjust padding for smaller navbar height */
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .navbar-brand img {
          width: 150px; /* Increase logo width */
          height: 150px; /* Increase logo height */
        }
        .navbar-nav {
          display: flex;
          gap: 20px;
        }
        .navbar-nav .nav-link {
          color: #fff;
          font-size: 18px;
          padding: 8px 16px;
        }
        .navbar-nav .nav-link.active {
          color: #fa2fb5;
        }
        .navbar-nav .nav-link:hover {
          color: #fa2fb5;
        }
        /* Style for Login and Register buttons */
        .navbar-nav .btn {
          color: #fff;
          background-color: #fa2fb5;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }
        .navbar-nav .btn:hover {
          background-color: #e63946;
        }
      `}</style>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          {/* Logo added here */}
          <a className="navbar-brand" href="#">
            <Image
              src="/AA.png" // Adjust your logo path
              alt="Logo"
              width={150} // Adjust logo size
              height={150} // Adjust logo size
            />
          </a>
          
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <a className="nav-link active" aria-current="page" href="#" style={{ fontFamily: 'CustomFont2' }}>Home</a>
              <a className="nav-link" href="/Courses" style={{ fontFamily: 'CustomFont2' }}>Courses</a>
              <a className="nav-link" href="/Instructors" style={{ fontFamily: 'CustomFont2' }}>Instructors</a>
            </div>
          </div>
           <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          </div>
          <div className="navbar-nav ms-auto"> {/* Align to the right */}
           { role=='guest' && <button  className="btn rounded-pill" onClick={loginRoute} type="button" style={{ fontFamily: 'CustomFont2' }}>Login</button>}
           { role=='guest' && <button className="btn rounded-pill" onClick={registerRoute} type="button" style={{ marginLeft: '10px',fontFamily: 'CustomFont2' }}>Register</button>}
            {!(role=='guest')&& <UserMenu role={role} name={name}></UserMenu>}
          </div>
        </div>
      </nav>
    </>
  );
}
export default NavBar
