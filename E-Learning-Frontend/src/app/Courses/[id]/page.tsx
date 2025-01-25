"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { Course } from "../../types/Course";
import CourseDetailsPage from "../Details/page";
// Remove incorrect import

export default function CourseById() { // useRouter() gives access to URL params
  const { id } = useParams(); // Extract 'id' from router.query
  const router = useRouter(); // Get router instance
  const [course, setCourse] = useState<Course | null>(null); // Initialize as null for better handling
  const [loading, setLoading] = useState<boolean>(true); // Handle loading state
  const [error, setError] = useState<string | null>(null); // Handle error state


  useEffect(() => {
    if(id=='Create' || id=='create'){
      router.push('/Create'); 
    }
    // Check if id exists in query
    if (id) {
      const fetchCourse = async () => {
        try {
          // Fetch the course using the id as part of the URL
          const response = await axios.get(`http://localhost:3000/Courses/${id}`,{
            withCredentials:true
          });
          setCourse(response.data); // Assume the response contains a single course
          setLoading(false); // Done loading
        } catch (err) {
          console.error("Error fetching course:", err);
          setError("Failed to fetch course details.");
          setLoading(false); // Done loading even on error
        }
      };

      fetchCourse(); // Call the async fetch function

    } else {
      setError("Course ID is missing.");
      setLoading(false); // Set loading to false if ID is missing
    }
  }, [id]); // Dependency array ensures the effect runs when 'id' changes

  // If the course is still loading, show a loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there's an error, display the error message
  if (error) {
    return <div>{error}</div>;
  }

  // Render the course details when available
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CourseDetailsPage course={course}></CourseDetailsPage>
    </div>
  );
}
