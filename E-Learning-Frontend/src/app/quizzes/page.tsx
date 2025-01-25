'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaTrash, FaEdit } from 'react-icons/fa';
import Cookies from 'js-cookie';
export default function QuizzesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    module_id: '',
    typeOfQuestions: [] as string[],
    numOfQuestions: 0,
    questions: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch module title
  useEffect(() => {
    const fetchModuleTitle = async () => {
      if (!moduleId) return;
      
      try {
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:3000/courses/any/modules/${moduleId}`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch module details');
        const moduleData = await response.json();
        setModuleTitle(moduleData.title);
      } catch (err) {
        console.error('Error fetching module title:', err);
        setModuleTitle('Unknown Module');
      }
    };

    fetchModuleTitle();
  }, [moduleId]);

  // Fetch quizzes when the page loads
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!moduleId) {
        setQuizzes([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/quizzes/m/m/${moduleId}`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch quizzes');
        const data = await response.json();
        // If data is a single quiz, convert to array, otherwise use as is
        setQuizzes(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError('Failed to load quizzes  or you are not authorized to access this page');
      }
    };
    fetchQuizzes();
  }, [moduleId]);

  // Modified handleFormChange to handle select dropdown
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'typeOfQuestions') {
      // Handle typeOfQuestions based on select value
      let types: string[] = [];
      switch (value) {
        case 'MCQ':
          types = ['MCQ'];
          break;
        case 'True/False':
          types = ['True/False'];
          break;
        case 'both':
          types = ['MCQ', 'True/False'];
          break;
        default:
          types = [];
      }
      setFormData({
        ...formData,
        typeOfQuestions: types,
      });
    } else if (name === 'numOfQuestions') {
      setFormData({
        ...formData,
        numOfQuestions: parseInt(value, 10),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle edit button click
  const handleEdit = (quiz: any) => {
    setEditingQuiz(quiz);
    setFormData({
      module_id: quiz.module_id,
      typeOfQuestions: quiz.typeOfQuestions || [],
      numOfQuestions: quiz.numOfQuestions || 0,
      questions: quiz.questions || [],
    });
  };

  // Handle update form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('jwt');
      console.log('formData:', formData); 
      const response = await fetch(`http://localhost:3000/quizzes/${editingQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quiz');
      }

      const updatedQuiz = await response.json();
      setQuizzes(prevQuizzes =>
        prevQuizzes.map(quiz =>
          quiz._id === updatedQuiz._id ? updatedQuiz : quiz
        )
      );

      setEditingQuiz(null);
      alert('Quiz updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete operation
  const handleDelete = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:3000/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete quiz');
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz._id !== quizId));
      alert('Quiz deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => router.push(`/dashboard`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </button>
          <h1>Quizzes for Module: {moduleTitle || 'Loading...'}</h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {editingQuiz ? (
        <div className="card mb-4 p-4">
          <h5 className="card-title">
            Edit Quiz for Module: {moduleTitle}
          </h5>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Module Title:</label>
              <input
                type="text"
                value={moduleTitle}
                className="form-control"
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Number of Questions:</label>
              <input
                type="number"
                name="numOfQuestions"
                value={formData.numOfQuestions}
                onChange={handleFormChange}
                className="form-control"
                min="1"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Types of Questions:</label>
              <select
                name="typeOfQuestions"
                value={
                  formData.typeOfQuestions.includes('MCQ') && 
                  formData.typeOfQuestions.includes('True/False') 
                    ? 'both'
                    : formData.typeOfQuestions[0] || ''
                }
                onChange={handleFormChange}
                className="form-select"
                required
              >
                <option value="">Select question types</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="True/False">True/False </option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary flex-grow-1"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Quiz'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingQuiz(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="row">
          {quizzes.map((quiz: any) => (
            <div key={quiz._id} className="col-lg-8 mb-4 mx-auto">
              <div className="card h-100 shadow-sm">
                <div className="card-body position-relative p-4">
                  <button
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-3"
                    onClick={() => handleDelete(quiz._id)}
                    title="Delete this quiz"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="btn btn-primary btn-sm position-absolute bottom-0 end-0 m-3"
                    onClick={() => handleEdit(quiz)}
                    title="Edit this quiz"
                  >
                    <FaEdit />
                  </button>

                  <div className="card-text">
                    <div className="mb-4">
                      <span className="badge bg-primary me-2 fs-6">
                        Questions: {quiz.numOfQuestions}
                      </span>
                      <span className="badge bg-success fs-6">
                        Types: {quiz.typeOfQuestions.join(', ')}
                      </span>
                    </div>

                    <div className="mt-4">
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}