'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
interface Answer {
  question_id: {
    question_text: string;
    correct_answer: string;
    difficulty: string;
  };
  user_answer: string;
  correct_answer: string;
}

interface Response {
  _id: string;
  quiz_id: {
    module_id: string;
  };
  score: number;
  message: string;
  submitted_at: string;
  answers: Answer[];
  difficulty: string;
}

export default function QuizResultPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const response_id = searchParams.get('response_id');
    
    const [result, setResult] = useState<Response | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);

    // get student data

    useEffect(() => {
      // call this api http://localhost:3000/auth/userData
      // get the student id from the response
      // setStudentId(studentId);

      const fetchStudentId = async () => {
        const token = Cookies.get('jwt');
        const response = await fetch('http://localhost:3000/auth/userData', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch student ID');
        const data = await response.json();
        setStudentId(data._id);
        console.log(data);
      };
      fetchStudentId();

    }, []);
    // Helper function for score color
    const getScoreColor = (score: number) => {
      if (score >= 75) return 'bg-success';
      if (score >= 50) return 'bg-warning';
      return 'bg-danger';
    };
  
    useEffect(() => {
      const fetchResult = async () => {
        if (!response_id) {
          setError('No response ID provided');
          setLoading(false);
          return;
        }
  
        try {
          const token = Cookies.get('jwt'); 
          const response = await fetch(`http://localhost:3000/responses/${response_id}`,{
            headers: {
              'Content-Type': 'application/json'},
            credentials: 'include',
          });
          if (!response.ok) throw new Error('Failed to fetch result');
          
          const data = await response.json();
          setResult(data);

          // Update user data one more time to ensure GPA is current
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.id) {
            const userResponse = await fetch(`socket.io-client/users/${user.id}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              const updatedUser = { ...user, gpa: userData.gpa };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              window.dispatchEvent(new CustomEvent('userDataUpdated', {
                detail: { gpa: userData.gpa }
              }));
            }
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchResult();
    }, [response_id]);
  
  
  
    if (loading) {
      return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
  
    if (error || !result) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error || 'Failed to load quiz result'}
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
  
    return (
      <div className="container py-5">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Quiz Result</h3>
          </div>
  
          <div className="card-body">
            {/* Score Section */}
            <div className="text-center mb-4">
              <div className={`display-1 fw-bold ${getScoreColor(result.score)} text-white p-4 rounded-circle d-inline-block`}>
                {result.score}%
              </div>
            </div>
  
            {/* Performance Message */}
            <div className="alert alert-info text-center mb-4">
              <h4 className="mb-0">{result.message}</h4>
            </div>
  
            {/* Quiz Details */}
            <div className="mb-4">
              <h5>Quiz Details:</h5>
              <p className="mb-1"><strong>Module:</strong> {result.quiz_id.module_id}</p>
              <p className="mb-1"><strong>Difficulty Level:</strong> {result.difficulty}</p>
              <p className="mb-1"><strong>Submitted:</strong> {new Date(result.submitted_at).toLocaleString()}</p>
            </div>
  
            {/* Answer Review */}
            <div className="mt-4">
              <h5>Answer Review:</h5>
              {result.answers.map((answer, index) => (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-title">{answer.question_id.question_text}</h6>
                    <p className="mb-1">
                      <strong>Your Answer:</strong> 
                      <span className={answer.user_answer === answer.correct_answer ? 'text-success' : 'text-danger'}>
                        {answer.user_answer}
                      </span>
                    </p>
                    {answer.user_answer !== answer.correct_answer && (
                      <p className="mb-0">
                        <strong>Correct Answer:</strong> 
                        <span className="text-success">{answer.correct_answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <div className="card-footer">
            <div className="d-grid gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => router.push(`/responses?moduleId=${result.quiz_id.module_id}&userId=${studentId}`)}
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
