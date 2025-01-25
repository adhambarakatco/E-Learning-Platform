'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const userId = searchParams.get('userId');
  const [userIds, setUserIds] = useState<string | null>(null);

  useEffect(() => { 
    setUserIds(userId);
  }
  , [userId]);  

  
  // Fetch quizzes when the page loads
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = Cookies.get('jwt');
        let response;
        if (moduleId) {
          response = await fetch(`http://localhost:3000/quizzes/m/m/${moduleId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });
        } else {
          response = await fetch(`http://localhost:3000/quizzes`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });
        }
        if (!response.ok) throw new Error('Failed to fetch quizzes');
        const data = await response.json();
        const normalizedData = Array.isArray(data) ? data : [data];
          
        setQuizzes(normalizedData);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes  or you are not authorized to access this page');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);


  const handleStartQuiz = (quizId: string) => {

    const userId = userIds;
    if (!userId) {
      alert('Please enter your User ID');
      return;
    }

    router.push(`/responses/quiz?quiz_id=${quizId}&user_id=${userId}`);
  };

  return (
    <main className="container py-4">
      <h1 className="text-center mb-4">Available Quizzes</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="alert alert-info" role="alert">
          No quizzes available.
        </div>
      )}
          <button 
            className="btn btn-outline-secondary"
            onClick={() => router.push('/dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </button>
      <div className="row">
        {quizzes && quizzes.map((quiz: any) => (
          <div key={quiz._id} className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Quiz for Module: {quiz.module_id}</h5>
                <p className="card-text">
                  <span className="badge bg-primary me-2">
                    Questions: {quiz.numOfQuestions}
                  </span>
                  <span className="badge bg-success">
                    Types: {quiz.typeOfQuestions.join(', ')}
                  </span>
                </p>
                <button 
                  className="btn btn-primary w-100"
                  onClick={() => handleStartQuiz(quiz._id)}
                  disabled={!userIds}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
