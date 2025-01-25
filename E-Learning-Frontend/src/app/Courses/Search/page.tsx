"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query"); // Get query from the URL
  const [searchQuery, setSearchQuery] = useState(query || ""); // Initialize with query
  const [searchResults, setSearchResults] = useState<any[]>([]); // Adjust type accordingly
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      // Fetch search results from the backend when the query changes
      fetchSearchResults(query);
    }
  }, [query]);

  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    setError(null);

    // Split the query by commas and send as an object to the backend
    const [title, category, level] = query.split(",");

    try {
      const response = await fetch("http://localhost:3000/courses/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          level,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data); // Set the search results in the state
      } else {
        setError("Failed to fetch search results");
      }
    } catch (err) {
      setError("An error occurred while fetching search results");
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8 bg-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded text-black"
          placeholder="Search for courses by title, category, level..."
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map((course: any) => (
              <div key={course._id} className="p-4 border rounded-md shadow-sm bg-white text-black">
                <h3 className="font-semibold">{course.title}</h3>
                <p>Category: {course.category}</p>
                <p>Level: {course.level}</p>
              </div>
            ))
          ) : (
            <p>No courses found.</p>
          )}
        </div>
      )}
    </div>
  );
}
