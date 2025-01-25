"use client";
import { useState } from "react";
import fetcher from "../../utils/fetcher";
import { useRouter } from "next/navigation";

const EnrollStudentsPage = () => {
  const [courseId, setCourseId] = useState<string>(""); // State for course ID input
  const [studentId, setStudentId] = useState<string>(""); // State for student ID input
  const [instructorId, setInstructorId] = useState<string>(""); // State for instructor ID input
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !studentId || !instructorId) {
      setErrorMessage("All fields (Course ID, Student ID, and Instructor ID) are required");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Call the backend API to enroll the student
      const response = await fetcher(
        `http://localhost:3000/courses/enroll`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, studentId, instructorId }), // Send all required IDs in the body
        }
      );

      if (response) {
        setSuccessMessage("Student successfully enrolled!");
        setCourseId(""); // Clear the input field
        setStudentId(""); // Clear the input field
        setInstructorId(""); // Clear the input field
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to enroll student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Enroll Student in Course
        </h1>
        <form onSubmit={handleEnrollSubmit} className="mb-6">
          <label htmlFor="courseId" className="block text-black font-medium mb-2">
            Enter Course ID
          </label>
          <input
            type="text"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-black"
            placeholder="Course ID"
          />

          <label htmlFor="studentId" className="block text-black font-medium mb-2 mt-4">
            Enter Student ID
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-black"
            placeholder="Student ID"
          />

          <label htmlFor="instructorId" className="block text-black font-medium mb-2 mt-4">
            Enter Instructor ID
          </label>
          <input
            type="text"
            id="instructorId"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-black"
            placeholder="Instructor ID"
          />

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Enrolling..." : "Enroll Student"}
          </button>
        </form>

        {/* Display Success or Error Messages */}
        {successMessage && (
          <p className="text-green-600 text-center">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-red-600 text-center">{errorMessage}</p>
        )}

        <button
          onClick={() => router.push(`/dashboard`)}
          className="w-full py-3 mt-6 bg-gray-500 text-white font-semibold rounded hover:bg-gray-600 transition"
        >
          Back to Courses
        </button>
      </div>
    </div>
  );
};

export default EnrollStudentsPage;
