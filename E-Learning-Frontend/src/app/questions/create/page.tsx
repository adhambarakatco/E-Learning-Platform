'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function CreateQuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const [moduleTitle, setModuleTitle] = useState<string>('');

  const initialFormState = {
    type: 'MCQ',
    options: ['', '', '', ''],
    correct_answer: '',
    module_id: moduleId || '',
    difficulty: 'B',
    question_text: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (moduleId) {
      setFormData(prev => ({
        ...prev,
        module_id: moduleId
      }));
    }
  }, [moduleId]);

  useEffect(() => {
    const fetchModuleTitle = async () => {
      if (!moduleId) return;
      
      try {
        const response = await fetch(`http://localhost:3000/courses/any/modules/${moduleId}`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const token = Cookies.get('jwt');
    fetch(`http://localhost:3000/question-bank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          
          return response.json().then((errorData) => {
            throw new Error(errorData.message || 'Failed to create question');
          });
        }
        return response.json();
      })
      .then(() => {
        setSuccess('Question created successfully!');
        resetForm();
        setTimeout(() => {
          router.push(`/questions?moduleId=${formData.module_id}`);
        }, 2000);
      })
      .catch((error: Error) => {
        setError(error.message);
      });
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-3">
              <h2 className="mb-0">Create a New Question</h2>
            </div>
            
            <div className="card-body p-4">
              {/* Messages */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Question Text */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Question Text</label>
                  <input
                    type="text"
                    name="question_text"
                    value={formData.question_text}
                    onChange={handleChange}
                    className="form-control form-control-lg"
                    placeholder="Enter your question"
                    required
                  />
                </div>

                {/* Type Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Question Type</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="True/False">True/False</option>
                  </select>
                </div>

                {/* Options for MCQ */}
                {formData.type === 'MCQ' && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">Options</label>
                    <div className="card border-light">
                      <div className="card-body bg-light">
                        {formData.options.map((option, index) => (
                          <div key={index} className="mb-3">
                            <div className="input-group">
                              <span className="input-group-text">Option {index + 1}</span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="form-control"
                                placeholder={`Enter option ${index + 1}`}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Correct Answer */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Correct Answer</label>
                  <input
                    type="text"
                    name="correct_answer"
                    value={formData.correct_answer}
                    onChange={handleChange}
                    className="form-control form-control-lg"
                    placeholder="Enter the correct answer"
                    required
                  />
                </div>

                {/* Difficulty */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Difficulty Level</label>
                  <select 
                    name="difficulty" 
                    value={formData.difficulty} 
                    onChange={handleChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="A">Hard</option>
                    <option value="B">Normal</option>
                    <option value="C">Easy</option>
                  </select>
                </div>

                {/* Module */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Module</label>
                  <input
                    type="text"
                    value={moduleTitle}
                    className="form-control form-control-lg"
                    disabled
                  />
                  <input
                    type="hidden"
                    name="module_id"
                    value={moduleId || ''}
                  />
                </div>

                {/* Buttons */}
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary btn-lg">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Question
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg"
                    onClick={resetForm}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}