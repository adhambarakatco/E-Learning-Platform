"use client";
import { useState } from "react";
import { Instructor } from "../types/Course";

const InstructorDetailsPage = ({ Instructor}: { Instructor: Instructor }) => {
  // State for the Instructor details
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Handle course click
  const handleCardClick = (course: any) => {
    window.location.href = `/Courses/${course._id}`;
  };

  return (
    <div className="min-h-screen d-flex justify-content-center align-items-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="card shadow-lg p-8 w-full max-w-4xl md:max-w-6xl"> {/* Adjusted max width for responsiveness */}
        <h1 className="card-name text-center text-black mb-6">{Instructor.name}</h1> {/* Increased margin */}

        {/* Center the inner card */}
        {Instructor && (
          <div
            className="card-body d-flex flex-column align-items-start"
            style={{ fontFamily: "CustomFont2, sans-serif" }}
          >
            {/* Instructor Info Section */}
            <div className="row mb-6 w-full">
              <div className="col-md-12 font-weight-bold text-black">Email: {Instructor.email || "N/A"}</div>
            </div>

            {/* Created Courses Section */}
            <div className="row mb-6 w-full">
              <div className="col-md-12 font-weight-bold text-black">Created Courses:</div>
              <div className="col-md-12">
                {Instructor.courses.length > 0 ? (
                  <ul className="list-unstyled text-center"> {/* Centering the list */}
                    {Instructor.courses.map((course, index) => (
                      <li
                        key={course._id || index}
                       
                        className="mb-4 cursor-pointer"
                      >
                        <span className="text-lg text-black">
                           <a href={`/Courses/${course._id}`} className="hover:text-indigo-600">
                               {course.title}
                           </a>
                        </span> {/* Text will be centered */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>No courses created</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDetailsPage;
