import React from "react";
import { Module } from "../../app/types/Module";
import { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

type AccordionProps = {
  modules: Module[];
  isGuest: boolean;
  isInstructor: boolean;
  isStudent: boolean;
};

type NotesState = {
  [moduleId: string]: any[];
};

const Accordion: React.FC<AccordionProps> = ({ modules, isGuest, isInstructor, isStudent }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<NotesState>({});
  const [newNotes, setNewNotes] = useState<{ [moduleId: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);   

  
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/userData", {
          withCredentials: true,
        });
        setStudentId(response.data._id);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
      }
    };

    getUserData();
  }, []);

  // Fetch notes for modules when studentId is available
  useEffect(() => {
    if (!studentId || !isStudent) return;

    const fetchNotesForModule = async (moduleId: string) => {
      try {
        const notesResponse = await axios.get(
          `http://localhost:3000/notes/${studentId}/${moduleId}`,
          { withCredentials: true }
        );

        if (notesResponse.data && Array.isArray(notesResponse.data)) {
          setNotes((prevNotes) => ({
            ...prevNotes,
            [moduleId]: notesResponse.data,
          }));
        }
      } catch (err: any) {
        console.error(`Error fetching notes for module ${moduleId}:`, err);
        setError("Failed to fetch notes");
      }
    };

    const fetchAllNotes = async () => {
      setLoading(true);
      try {
        await Promise.all(modules.map((module) => fetchNotesForModule(module._id)));
      } catch (err: any) {
        console.error("Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotes();
  }, [studentId, modules, isStudent]);

  const renderFile = (filePath: string) => {
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    const fileUrl = `http://localhost:3000/${filePath}`;
    
    if (fileExtension === 'pdf') {
      return <embed src={fileUrl} width="100%" height="600px" type="application/pdf" />;
    }
    
    if (fileExtension === 'mp4') {
      return (
        <video controls width="100%">
          <source src={fileUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return <p>Unsupported file type</p>;
  };

  const handleEditContentChange = (content: string) => {
    setEditedContent(content);
  };


  const handleUpdateNote = async (moduleId: string, noteId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `http://localhost:3000/notes/${noteId}`,
        {
          content: editedContent
        },
        { withCredentials: true }
      );

      if (response.data) {
        setNotes(prevNotes => ({
          ...prevNotes,
          [moduleId]: prevNotes[moduleId].map(note => 
            note._id === noteId ? { ...note, content: editedContent } : note
          )
        }));
        setEditingNote(null);
        setEditedContent("");
      }
    } catch (err: any) {
      console.error("Error updating note:", err);
      setError(err.response?.data?.message || "Failed to update the note");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickNoteSubmit = async (moduleId: string) => {
    if (!newNotes[moduleId]?.trim()) {
      setError("Note content cannot be empty");
      return;
    }

    
    try {
      setLoading(true);
      setError(null);

      
      const response = await axios.post(
        `http://localhost:3000/notes`,
        {
          title: "Quick Note",
          content: newNotes[moduleId],
          moduleId: moduleId,
          studentId: studentId
        },
        { withCredentials: true }
      );

      if (response.data) {
        setNotes(prevNotes => ({
          ...prevNotes,
          [moduleId]: [...(prevNotes[moduleId] || []), response.data]
        }));
        setNewNotes(prev => ({ ...prev, [moduleId]: "" }));
      }
    } catch (err: any) {
      console.error("Error submitting note:", err);
      setError(err.response?.data?.message || "Failed to save the note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (moduleId: string, noteId: string) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`http://localhost:3000/notes/${noteId}`, {
        withCredentials: true,
      });

      setNotes(prevNotes => ({
        ...prevNotes,
        [moduleId]: prevNotes[moduleId].filter((note) => note._id !== noteId)
      }));
    } catch (err: any) {
      console.error("Error deleting note:", err);
      setError(err.response?.data?.message || "Failed to delete the note");
    } finally {
      setLoading(false);
    }
  };

  const toggleOutdated = async (moduleId: string, course_id: string, outdatedStatus: boolean) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3000/courses/${course_id}/modules/${moduleId}/flag`,
        { "flag": !outdatedStatus },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const updatedModules = modules.map((module) =>
          module._id === moduleId ? { ...module, outdated: !outdatedStatus } : module
        );
        // Update the modules state with the new outdated status
        // Assuming you have a state to manage `modules` in the parent component
      }
    } catch (error) {
      console.error("Error updating outdated status", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accordion accordion-flush" id="accordionFlushExample">
      {modules.map((module) => (
        <div className="accordion-item" key={module._id}>
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#flush-collapse-${module._id}`}
              aria-expanded="false"
              aria-controls={`flush-collapse-${module._id}`}
              onClick={() => console.log("module._id", module._id)}
            >
              {module.title}
            </button>
          </h2>
          <div
            id={`flush-collapse-${module._id}`}
            className="accordion-collapse collapse"
            data-bs-parent="#accordionFlushExample"
            data-bs-target={`#flush-collapse-${module._id}`}

          >
            <div className="accordion-body">
              <p>{module.content}</p>
              
              {module.filePath && module.filePath.length > 0 && (
                console.log(module._id),
                <div>
                  {module.filePath.map((filePath, index) => (
                    <div key={index} className="file-item">
                      <div>{filePath}</div>
                      {!isGuest && renderFile(filePath)}
                    </div>
                  ))}
                </div>
              )}

              {isStudent || isInstructor && (
                <a href={`/quizzes?moduleId=${module._id}`} className="btn btn-primary me-2">
                  <i className="bi bi-file-text me-2"></i>
                  View Quiz
                </a>
              )}

              {isInstructor && (
                <a href={`/questions?moduleId=${module._id}`} className="btn btn-secondary me-2">
                  <i className="bi bi-question-circle me-2"></i>
                  View Question Banks
                </a>
              )}

              {isStudent && (
                <>
                  <a href={`/responses?moduleId=${module._id}&userId=${studentId}`} className="btn btn-primary me-2">
                    <i className="bi bi-file-text me-2"></i>
                    Take Quiz
                  </a>

                  <h4>Quick Note</h4>
                  <textarea
                    className="form-control mb-2"
                    placeholder="Write a quick note..."
                    value={newNotes[module._id] || ""}
                    onChange={(e) => setNewNotes(prev => ({
                      ...prev,
                      [module._id]: e.target.value
                    }))}
                  />
                  <button 
                    className="btn btn-primary mb-4" 
                    onClick={() => handleQuickNoteSubmit(module._id)}
                  >
                    Save Note
                  </button>

                  <div>
                    <h2>Saved Notes</h2>
                    {notes[module._id]?.length > 0 ? (
                      notes[module._id].map((note) => (
                        <div key={note._id} className="mb-3 p-3 border rounded">
                          {editingNote === note._id ? (
                            <>
                              <textarea
                                className="form-control mb-2"
                                value={editedContent}
                                onChange={(e) => handleEditContentChange(e.target.value)}
                              />
                              <button
                                className="btn btn-success me-2"
                                onClick={() => handleUpdateNote(module._id, note._id)}
                              >
                                Save Changes
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setEditingNote(null);
                                  setEditedContent("");
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{note.content}</p>
                              <button
                                className="btn btn-warning me-2"
                                onClick={() => {
                                  setEditingNote(note._id);
                                  setEditedContent(note.content);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteNote(module._id, note._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No notes available for this module</p>
                    )}
                  </div>
                </>
              )}

              {isInstructor && (
                <>
                  <a href={`/Courses/${module.course_id}/update-module/${module._id}`} className="btn btn-secondary me-2">
                    <i className="bi bi-pencil-square me-2" />
                    Edit Module
                  </a>
                  
                  <button
                    className={`btn ${module.outdated ? 'btn-danger' : 'btn-warning'}`}
                    onClick={() => toggleOutdated(module._id, module.course_id, module.outdated)}
                    disabled={loading}
                  >
                    {module.outdated ? 'Outdated' : 'Set Outdated'}
                  </button>
                </>
              )}

              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;