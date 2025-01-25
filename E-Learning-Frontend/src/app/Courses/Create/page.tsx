'use client';

import { useState } from 'react';
import fetcher from '../../utils/fetcher';
import { useRouter } from 'next/navigation';
import usermenu from '../../../components/ui/UserMenu';
const CreateCoursePage = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [level, setLevel] = useState<string>('beginner');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category) {
      setErrorMessage('All fields (Title, Description, and Category) are required.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetcher('http://localhost:3000/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, description, category, level }),
      });

      if (response) {
        setSuccessMessage('Course successfully created!');
        setTitle('');
        setDescription('');
        setCategory('');
        setLevel('beginner');
        setTimeout(() =>  {
          router.push(`/dashboard?role=instructor`);
        }, 2000);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMessage('Unauthorized! Please log in.');
        router.push('/login');
      } else {
        setErrorMessage(err.message || 'Failed to create the course.');
      }
    }
    finally{setLoading(false)}
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
          font-family: 'CustomFont', sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .form-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%; /* Full width of the form card */
        }
        .form-control {
          width: 100%; /* Full width of the input */
        }
      `}</style>
      <div className="min-h-screen bg-[#31087b] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8 font-['CustomFont']">Create a New Course</h1>
  
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
  
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
  
          <form onSubmit={handleCreateSubmit} className="form-container space-y-6">
            <div className="form-control">
              <label className="text-sm font-medium text-gray-700 font-['CustomFont2']">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
  
            <div className="form-control">
              <label className="text-sm font-medium text-gray-700 font-['CustomFont2']">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500 resize-none"
              />
            </div>
  
            <div className="form-control">
              <label className="text-sm font-medium text-gray-700 font-['CustomFont2']">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
  
            <div className="form-control">
              <label className="text-sm font-medium text-gray-700 font-['CustomFont2']">
                Difficulty Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
  
            <button
              type="submit"
              disabled={loading}
              className="mt-6 px-6 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 transition-colors duration-200"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
  
  };

export default CreateCoursePage;
