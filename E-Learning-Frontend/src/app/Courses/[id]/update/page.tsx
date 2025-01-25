'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const UpdateCoursePage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [red, setRed] = useState<boolean | null>(null);
  const [courseData, setCourseData] = useState<any>({}); // Holds current course data
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  // Fetch current course data when the page loads
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/courses/${courseId}`,{
          withCredentials:true
        });
        setCourseData(response.data);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setMessage('Error fetching course data.');
        setRed(true);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    const title = e.currentTarget.id1.value;
    const description = e.currentTarget.description.value;
    const category = e.currentTarget.category.value;
    const level = e.currentTarget.level.value;

   
   
    
    try {
      const response = await axios.put(
        `http://localhost:3000/courses/${courseId}`,{
            title: title,
            description: description,
            category: category,
             level: level,
        }
        ,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage('Course updated successfully');
        setRed(false);

        router.push(`/dashboard`);
        
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      setMessage(error.response?.data?.message || 'An error occurred while updating the course');
      setRed(true);
    } finally {
      setLoading(false);
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
          background-color: #31087b;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Cpath fill='%23fa2fb5' fill-
          font-family: 'CustomFont', sans-serif;
          background-color: #31087b; /* Page background color */
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <div className="container py-5">
        <div className="card shadow-lg">
          {/* Header Section */}
          <div className="card-header bg-primary text-white text-center py-4">
            <h1 className="h3" style={{ fontFamily: "CustomFont, sans-serif" }}>
              Update Course
            </h1>
          </div>

          {/* Content Section */}
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Title Section */}
              <div className="mb-4">
                <h2 className="h5">Course Title</h2>
                <textarea
                  id="id1"
                  name="id1"
                  className="form-control"
                  rows={1}
                  style={{ fontFamily: "CustomFont2" }}
                  required
                  defaultValue={courseData.title}
                />
              </div>

              {/* Description Section */}
              <div className="mb-4">
                <h2 className="h5">Course Description</h2>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows={2}
                  style={{ fontFamily: "CustomFont2" }}
                  required
                  defaultValue={courseData.description}
                />
              </div>

              {/* Category Section */}
              <div className="mb-4">
                <h2 className="h5">Category</h2>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-control"
                  style={{ fontFamily: "CustomFont2" }}
                  required
                  defaultValue={courseData.category}
                />
              </div>

              {/* Level Section */}
              <div className="mb-4">
                <h2 className="h5">Level</h2>
                <input
                  type="text"
                  id="level"
                  name="level"
                  className="form-control"
                  style={{ fontFamily: "CustomFont2" }}
                  required
                  defaultValue={courseData.level}
                />
              </div>

             

              {/* Message Box */}
              {message && (
                <div
                  className={`alert ${red ? "alert-danger" : "alert-success"} mt-4`}
                  role="alert"
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <div className="d-flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Course"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push(`/dashboard`)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateCoursePage;
