'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
interface Question {
  _id: string;
  question_text: string;
  type: string;
  options: string[];
  difficulty: string;
}

export default function TakeQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quiz_id = searchParams.get('quiz_id');
  const user_id = searchParams.get('user_id');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentGPA, setCurrentGPA] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: string; user_answer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Modify socket initialization to only listen for GPA updates after quiz submission
  useEffect(() => {
    if (!user_id) return;

    const socketInstance = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      ;
      socketInstance.emit('join:room', user_id);
    });

    // Only update GPA if quiz has been submitted
    socketInstance.on('gpaUpdated', (data: { gpa: number }) => {
      ;
      if (quizSubmitted && typeof data.gpa === 'number') {
        setCurrentGPA(data.gpa);
      }
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.off('gpaUpdated');
        socketInstance.disconnect();
      }
    };
  }, [user_id, quizSubmitted]);

  // Modify the useEffect for quiz initialization
  useEffect(() => {
    if (!quiz_id || !user_id) {
      setError('Missing quiz ID or user ID');
      return;
    }

    const initializeQuiz = async () => {
      try {
        setLoading(true);
        // First get the questions based on user's GPA
        const questionsResponse = await fetch(
          `http://localhost:3000/quizzes/${user_id}/${quiz_id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          }
        );

        if (!questionsResponse.ok) {
          console.log(questionsResponse);
          const errorData = await questionsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch questions');
        }

        const questionsData = await questionsResponse.json();
        ;

        if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
          throw new Error('No questions available for this quiz');
        }

        // Set questions and initialize answers array
        setQuestions(questionsData);
        setAnswers(questionsData.map(q => ({
          question_id: q._id,
          user_answer: '' // Initialize with empty string
        })));

      } catch (err: any) {
        console.error('Quiz initialization error:', err);
        setError(typeof err === 'string' ? err : err.message || 'Failed to initialize quiz');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [quiz_id, user_id]);

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      question_id: questions[currentQuestion]._id,
      user_answer: answer,
    };
    setAnswers(newAnswers);
  };

  // Modify handleSubmit to validate answers before submission
  const handleSubmit = async () => {
    // Validate that all questions have answers
    const unansweredQuestions = answers.some(answer => !answer.user_answer);
    if (unansweredQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:3000/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        }, credentials: 'include',
        body: JSON.stringify({
          quiz_id,
          user_id,
          answers: answers.map(answer => ({
            question_id: answer.question_id,
            user_answer: answer.user_answer
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const result = await response.json();
      setQuizSubmitted(true);
      
      // Wait for the server to process and emit the GPA update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      window.location.href = `/responses/result?response_id=${result._id}`;
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => router.push('/responses')}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Remove the result-related JSX and keep only the quiz-taking interface
  return (
    <div className="container py-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Question {currentQuestion + 1} of {questions.length}</h4>
            <div className="d-flex align-items-center gap-3">
              {currentGPA !== null && (
                <div className="badge bg-light text-primary fs-6">
                  Current GPA: {currentGPA.toFixed(2)}
                </div>
              )}
              <div className="progress" style={{ width: '200px' }}>
                <div 
                  className="progress-bar" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          {questions[currentQuestion] && (
            <>
              <h5 className="card-title mb-4">{questions[currentQuestion].question_text}</h5>
              
              <div className="d-grid gap-2">
                {questions[currentQuestion].type === 'MCQ' ? (
                  questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className={`btn btn-outline-primary text-start p-3 ${
                        answers[currentQuestion]?.user_answer === option ? 'active' : ''
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      className={`btn btn-outline-primary p-3 ${
                        answers[currentQuestion]?.user_answer === 'True' ? 'active' : ''
                      }`}
                      onClick={() => handleAnswerSelect('True')}
                    >
                      True
                    </button>
                    <button
                      className={`btn btn-outline-primary p-3 ${
                        answers[currentQuestion]?.user_answer === 'False' ? 'active' : ''
                      }`}
                      onClick={() => handleAnswerSelect('False')}
                    >
                      False
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="card-footer d-flex justify-content-between p-3">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={submitting || !answers[currentQuestion]}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!answers[currentQuestion]}
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Floating GPA indicator with animation */}
      {currentGPA !== null && (
        <div 
          className="position-fixed bottom-0 end-0 m-4 p-3 bg-white shadow rounded"
          style={{ 
            zIndex: 1000,
            transition: 'all 0.3s ease-in-out',
            animation: 'fadeIn 0.5s'
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Current GPA:</span>
            <span className="badge bg-primary fs-5">{currentGPA.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Add some CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}