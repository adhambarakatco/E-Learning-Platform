'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
export default function CreateQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');

  const [formData, setFormData] = useState({
    module_id: moduleId || '',
    typeOfQuestions: [] as string[],
    numOfQuestions: 0,
    questionsA: [] as any[],
    questionsB: [] as any[],
    questionsC: [] as any[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState({
    A: 0,
    B: 0,
    C: 0
  });

  // Fetch available questions count
  useEffect(() => {
    const fetchQuestionCounts = async () => {
      if (!moduleId) return;

      try {
        const response = await fetch(`http://localhost:3000/question-bank/m/module/${moduleId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch questions');
        
        const questions = await response.json();
        const counts = {
          A: questions.filter((q: any) => q.difficulty === 'A').length,
          B: questions.filter((q: any) => q.difficulty === 'B').length,
          C: questions.filter((q: any) => q.difficulty === 'C').length
        };
        
        setAvailableQuestions(counts);
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };

    fetchQuestionCounts();
  }, [moduleId]);

  // Update formData when moduleId changes
  useEffect(() => {
    if (moduleId) {
      setFormData(prev => ({
        ...prev,
        module_id: moduleId
      }));
    }
  }, [moduleId]);

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'typeOfQuestions') {
      // Handle multiple question types
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate question counts
    const requiredQuestions = Math.ceil(formData.numOfQuestions / 3);
    if (availableQuestions.A < requiredQuestions) {
      setError(`Not enough Hard (A) questions. Available: ${availableQuestions.A}, Required: ${requiredQuestions}`);
      setLoading(false);
      return;
    }
    if (availableQuestions.B < requiredQuestions) {
      setError(`Not enough Medium (B) questions. Available: ${availableQuestions.B}, Required: ${requiredQuestions}`);
      setLoading(false);
      return;
    }
    if (availableQuestions.C < requiredQuestions) {
      setError(`Not enough Easy (C) questions. Available: ${availableQuestions.C}, Required: ${requiredQuestions}`);
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:3000/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          questionsA: [],
          questionsB: [],
          questionsC: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quiz');
      }

      alert('Quiz created successfully!');
      router.push(`/quizzes?moduleId=${moduleId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5 bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">Create a New Quiz</h3>
            </div>

            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="needs-validation">
                {/* Module ID Input - now readonly when provided via URL */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-folder me-2"></i>
                    Module ID
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-hash"></i>
                    </span>
                    <input
                      type="text"
                      name="module_id"
                      value={formData.module_id}
                      onChange={handleFormChange}
                      className="form-control form-control-lg"
                      placeholder="Enter module ID"
                      required
                      readOnly={!!moduleId} // Make readonly if moduleId is provided
                    />
                  </div>
                </div>

                {/* Question Type Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-list-check me-2"></i>
                    Type of Questions
                  </label>
                  <select
                    name="typeOfQuestions"
                    value={
                      formData.typeOfQuestions.includes('MCQ') && 
                      formData.typeOfQuestions.includes('True/False')
                        ? 'both'
                        : formData.typeOfQuestions[0] || ''
                    }
                    onChange={handleFormChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="">Select question types</option>
                    <option value="MCQ">Multiple Choice Questions</option>
                    <option value="True/False">True/False</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Number of Questions */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-123 me-2"></i>
                    Number of Questions
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-hash"></i>
                    </span>
                    <input
                      type="number"
                      name="numOfQuestions"
                      value={formData.numOfQuestions}
                      onChange={handleFormChange}
                      className="form-control form-control-lg"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Add question availability information */}
                <div className="alert alert-info mb-4">
                  <h6 className="mb-2">Available Questions:</h6>
                  <div>Hard (A): {availableQuestions.A}</div>
                  <div>Medium (B): {availableQuestions.B}</div>
                  <div>Easy (C): {availableQuestions.C}</div>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Quiz...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Quiz
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => router.push(`/questions?moduleId=${moduleId}`)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Questions
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
