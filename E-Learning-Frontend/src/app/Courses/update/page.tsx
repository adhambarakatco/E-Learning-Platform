"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import fetcher from "../../utils/fetcher";

const UpdateCoursePage = () => {
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedCourse = {
        title,
        description,
        category,
        level,
      };

      const response = await fetcher(
        `http://localhost:3000/courses/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCourse),
        }
      );

      setSuccess("Course updated successfully!");
      setLoading(false);

      // Optionally, navigate back to the course details page
      setTimeout(() => router.push(`/courses/${courseId}`), 2000);
    } catch (err) {
      setError("Failed to update course. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Update Course
        </h1>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}
        {success && <p className="text-center text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-black font-medium mb-2" htmlFor="courseId">
              Course ID
            </label>
            <input
              id="courseId"
              type="text"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter course ID"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black font-medium mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter course title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black font-medium mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter course description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black font-medium mb-2" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter course category"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black font-medium mb-2" htmlFor="level">
              Level
            </label>
            <input
              id="level"
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter course level"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            {loading ? "Updating..." : "Update Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateCoursePage;
