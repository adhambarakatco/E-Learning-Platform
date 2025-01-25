'use client';
import { useState, useEffect } from "react";
import { Course } from "../types/Course";
import axios from "axios";
import Accordion from "@/components/ui/Accordion";
import { Module } from "../types/Module";

const InstructorDetailsPage = ({ course }: { course: Course }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [red, setRed] = useState<boolean | null>(null);
  const [newKeyword, setNewKeyword] = useState<string>("");

  useEffect(() => {
    const fetchModules = async () => {
      if (!course?._id) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/courses/${course._id}/modules`,
          { withCredentials: true }
        );
        setModules(response.data);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
        setError("Failed to fetch modules.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [course?._id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        const response = await axios.delete("http://localhost:3000/courses/delete", {
          withCredentials: true,
          data: { courseId: course._id },
        });

        if (response.status === 200) {
          ;
          setMessage("Course successfully deleted.");
          setRed(false);
        } else {
          setMessage("Failed to delete the course.");
          setRed(true);
        }
      } catch (error: any) {
        console.error(error.response.message)
        setError(error.response?.data || "An error occurred.");
        console.error("Error deleting course:", error.message);
        setMessage("An error occurred while deleting the course.");
        setRed(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
  
    try {
      const response = await axios.post(
        "http://localhost:3000/courses/invite", 
        { courseId: course._id, email:email }, 
        { withCredentials: true }
      );
      
      if (response.status === 201) {
        ;
        setMessage(` ${email} Enrolled to course.`);
        setRed(false);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred.");
      setMessage(error.response?.data?.message || "An error occurred.");
      setRed(true);
    } finally {
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
    }
  };

  const handleAddKeyword = async () => {
    if (newKeyword.trim() !== "") {
      try {
        const response = await axios.post(
          `http://localhost:3000/courses/keyword/${course._id}`,
          { keyword: newKeyword.trim()},
          { withCredentials: true }
        );

        if (response.status === 201) {
          course.keywords.push(newKeyword.trim());
          setNewKeyword("");
          setMessage("Keyword added successfully.");
          setRed(false);
        } else {
          setMessage("Failed to add keyword.");
          setRed(true);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || "An error occurred.");
        setMessage(error.response?.data?.message || "An error occurred.");
        setRed(true);
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center py-4">
          <h1 className="h3" style={{ fontFamily: "CustomFont, sans-serif" }}>
            {course.title}
          </h1>
        </div>

        <div className="card-body">
          <div className="mb-4">
            <h2 className="h5">DESCRIPTION</h2>
            <p style={{ fontFamily: "CustomFont2" }} className="text-muted">{course.description || "No description available"}</p>
          </div>

          <div className="mb-4">
            <h2 className="h5">CATEGORY</h2>
            <p style={{ fontFamily: "CustomFont2" }} className="text-muted">{course.category}</p>
          </div>

          <div className="mb-4">
            <h2 className="h5">COURSE DETAILS</h2>
            <div className="row">
              <div className="col-md-6 mb-3">
                <h3 className="h6">LEVEL</h3>
                <p style={{ fontFamily: "CustomFont2" }} className="text-muted">{course.level}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h3 className="h6">VERSION</h3>
                <p style={{ fontFamily: "CustomFont2" }} className="text-muted">{course.versionNumber}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="h5">KEYWORDS</h2>
            <div className="d-flex flex-wrap gap-2">
              {course.keywords.map((keyword, index) => (
                <span key={index} style={{ fontFamily: "CustomFont2" }} className="badge bg-primary text-white">
                  {keyword}
                </span>
              ))}
            </div>
            <div className="mt-3 d-flex">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="form-control"
                placeholder="Add new keyword"
                style={{ fontFamily: "CustomFont2" }}
              />
              <button onClick={handleAddKeyword} className="btn btn-primary ms-2">
                Add Keyword
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="h5">COURSE MODULES</h2>
            {modules && modules.length > 0 ? (
              <Accordion modules={modules} isGuest={false} isInstructor={true} isStudent={false} />
            ) : (
              <p style={{ fontFamily: "CustomFont2" }} className="text-muted">No modules available for this course.</p>
            )}
          </div>

          {message && (
            <div
              className={`alert ${red ? "alert-danger" : "alert-success"} mt-4`}
              role="alert"
            >
              {message}
            </div>
          )}

          <div className="mt-5">
            <h2 className="h5">Enroll STUDENTS</h2>
            <form onSubmit={handleInvite} className="d-flex flex-column flex-md-row align-items-md-end gap-3">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter student email"
                  style={{ fontFamily: "CustomFont2" }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Enroll Student to course
              </button>
            </form>
          </div>

          {/* Course Management Section */}
          <div className="mt-5">
            <h2 className="h5">COURSE MANAGEMENT</h2>
            <div className="d-flex gap-3">
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = `/Courses/${course._id}/create-module`}
              >
                Create New Module
              </button>
              <button
                className="btn btn-warning"
                onClick={() => window.location.href = `/Courses/${course._id}/update`}
              >
                Update Course
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailsPage;
