"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DeleteCoursePage = () => {
  const router = useRouter();
  const [courseId, setCourseId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle form submission to delete the course
  const handleDeleteCourse = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/courses/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, instructorId }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Course with ID ${data._id} has been deleted.`);
        setError('');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete the course.');
        setMessage('');
      }
    } catch (err) {
      setError('An error occurred while deleting the course.');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Delete Course</h1>

      <form onSubmit={handleDeleteCourse} className="max-w-md mx-auto bg-gray-700 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="courseId" className="block text-sm font-semibold mb-2">Course ID</label>
          <input
            type="text"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-4 py-2 rounded text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="instructorId" className="block text-sm font-semibold mb-2">Instructor ID</label>
          <input
            type="text"
            id="instructorId"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full px-4 py-2 rounded text-black"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Course
          </button>
        </div>
      </form>

      {/* Display the message or error */}
      {message && (
        <div className="mt-4 text-green-500 text-center">{message}</div>
      )}
      {error && (
        <div className="mt-4 text-red-500 text-center">{error}</div>
      )}
    </div>
  );
};

export default DeleteCoursePage;
