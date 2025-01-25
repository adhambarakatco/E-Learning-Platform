'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaTrash, FaEdit } from 'react-icons/fa';
import Cookies from 'js-cookie';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    type: 'MCQ',
    options: ['', '', '', ''],
    correct_answer: '',
    question_text: '',
    difficulty: 'B',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');

  // Add new useEffect to fetch module details
  useEffect(() => {
    const fetchModuleTitle = async () => {
      if (!moduleId) return;
      
      try {
        const response = await fetch(`http://localhost:3000/courses/any/modules/${moduleId}`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        console.log(response);
        if (!response.ok) {          
          throw new Error('Failed to fetch module details');

        } 
        console.log(response);
        const moduleData = await response.json();
        console.log(moduleData);  
        setModuleTitle(moduleData.title);
      } catch (err) {
        setModuleTitle(moduleId);
        
      }
    };

    fetchModuleTitle();
  }, [moduleId]);

  // Fetch questions when the page loads
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!moduleId) {
          setQuestions([]);
          return;
        }
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:3000/question-bank/m/module/${moduleId}`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch questions or you are not an instructor');
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError('There is no question available for this module');
      }
    };
    fetchQuestions();
  }, [moduleId]);

  // Handle delete operation
  const handleDelete = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:3000/question-bank/${questionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete question');
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q._id !== questionId));
      alert('Question deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete question. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (question: any) => {
    const options = question.type === 'MCQ'
      ? [...(question.options || []), '', '', '', ''].slice(0, 4)  // Ensure 4 options for MCQ
      : ['True', 'False'];  // Always 2 options for True/False

    setEditingQuestion(question);
    setFormData({
      ...question,
      options: options,
    });
  };

  // Handle form data change for editing
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Reset options based on question type
      const newOptions = value === 'MCQ' 
        ? ['', '', '', '']  // 4 options for MCQ
        : ['True', 'False']; // 2 options for True/False
      
      setFormData({
        ...formData,
        type: value,
        options: newOptions,
        correct_answer: '', // Reset correct answer when changing type
      });
    } else if (name === 'options' && index !== undefined) {
      const updatedOptions = [...formData.options];
      updatedOptions[index] = value;
      setFormData({ ...formData, options: updatedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle update form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:3000/question-bank/${editingQuestion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update question');
      const updatedQuestion = await response.json();

      // Update questions list without reloading the page
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question._id === updatedQuestion._id ? updatedQuestion : question
        )
      );

      alert('Question updated successfully');
      setEditingQuestion(null); // Close the edit form
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => router.push('/dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </button>
          <h1>Questions for Module: {moduleTitle || 'Loading...'}</h1>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => router.push(`/questions/create?moduleId=${moduleId}`)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create New Question
          </button>
          <button 
            className="btn btn-success"
            onClick={() => router.push(`/quizzes/create?moduleId=${moduleId}`)}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Create Quiz
          </button>
        </div>
      </div>

      <div className="alert alert-info mb-4" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Important:</strong> Please ensure an equal distribution of questions across all difficulty levels (Easy, Medium, Hard) to be able to make the quiz correctly.
        <hr />
        <div className="d-flex justify-content-around text-center">
          <div>
            <span className="badge bg-danger mb-2">Hard</span>
            <br />
            {questions.filter(q => q.difficulty === 'A').length} questions
          </div>
          <div>
            <span className="badge bg-warning mb-2">Medium</span>
            <br />
            {questions.filter(q => q.difficulty === 'B').length} questions
          </div>
          <div>
            <span className="badge bg-success mb-2">Easy</span>
            <br />
            {questions.filter(q => q.difficulty === 'C').length} questions
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
        </div>
      )}

      {editingQuestion ? (
        <div className="card mb-4 p-4">
          <h5 className="card-title">Edit Question</h5>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Question Text:</label>
              <input
                type="text"
                name="question_text"
                value={formData.question_text}
                onChange={handleFormChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Type:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="form-select"
                required
              >
                <option value="MCQ">MCQ</option>
                <option value="True/False">True/False</option>
              </select>
            </div>

            {formData.type === 'MCQ' && (
              <div className="mb-3">
                <label className="form-label">Options:</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      name="options"
                      value={option}
                      onChange={(e) => handleFormChange(e, index)}
                      className="form-control"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Correct Answer:</label>
              <input
                type="text"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleFormChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Difficulty:</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleFormChange}
                className="form-select"
                required
              >
                <option value="A">Hard</option>
                <option value="B">Normal</option>
                <option value="C">Easy</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Updating...' : 'Update Question'}
            </button>
          </form>
        </div>
      ) : (
        <div className="row">
          {questions.length === 0 ? (
            <div className="col-12 text-center">
              <p className="text-muted">No questions available for this module.</p>
              <button 
                className="btn btn-primary"
                onClick={() => router.push(`/questions/create?moduleId=${moduleId}`)}
              >
                Create Your First Question
              </button>
            </div>
          ) : (
            questions.map((question: any) => (
              <div key={question._id} className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body position-relative">
                    <button
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                      onClick={() => handleDelete(question._id)}
                      title="Delete this question"
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="btn btn-primary btn-sm position-absolute bottom-0 end-0 m-2"
                      onClick={() => handleEdit(question)}
                      title="Edit this question"
                    >
                      <FaEdit />
                    </button>

                    <h5 className="card-title">{question.question_text}</h5>
                    <div className="card-text">
                      <p className="mb-2">
                        <span className="badge bg-primary me-2">Type: {question.type}</span>
                        <span
                          className={`badge ${
                            question.difficulty === 'A'
                              ? 'bg-danger'
                              : question.difficulty === 'B'
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                        >
                          Difficulty:{' '}
                          {question.difficulty === 'A'
                            ? 'Hard'
                            : question.difficulty === 'B'
                            ? 'Medium'
                            : 'Easy'}
                        </span>
                      </p>
                      <div className="mt-3">
                        <p className="fw-bold mb-2">Options:</p>
                        <ul className="list-group mb-4">
                          {question.options.map((option: string, index: number) => (
                            <li key={index} className="list-group-item">
                              {option}
                              {option === question.correct_answer && (
                                <span className="badge bg-success float-end">✓ Correct</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
