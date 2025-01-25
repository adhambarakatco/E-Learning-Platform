import { useState, useEffect, useRef } from "react";
import { Course } from "../types/Course";
import { Module } from "../types/Module";
import axios from "axios";
import Accordion from "@/components/ui/Accordion";
import styles from "./StudentCourseDetails.module.css";

const StudentCourseDetails = ({ course }: { course: Course }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [moduleContent, setModuleContent] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

   // Fetch modules for the course
   useEffect(() => {
    const fetchModules = async () => {
      if (!course?._id) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/courses/${course._id}/modules`,
          { withCredentials: true }
        );
        setModules(response.data);
      } catch (err: any) {
        
        setError("Failed to fetch modules.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchModules();
  }, [course?._id]);


// Update module content when selected module changes
useEffect(() => {
  if (selectedModule) {
    const selectedModuleData = modules.find((mod) => mod._id === selectedModule);
    setModuleContent(selectedModuleData?.content || "No content available for this module.");
  }
}, [selectedModule, modules]);


  // Fetch module details
  const fetchModuleDetails = async (moduleId: string) => {
    try {
      setLoading(true);
      const moduleResponse = await axios.get(
        `http://localhost:3000/courses/${course._id}/modules`,
        { withCredentials: true }
      );
      const moduleData = moduleResponse.data;

      setModuleContent(moduleData.content || "No content available for this module.");
      // setFilePath(moduleData.filePath || []);
      // extract the file path from every module data as it's an array of objects
      setFilePath(moduleData.map((module: any) => module.filePath).flat());
      
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.error("Module not found:", err);
        setModuleContent("Module not found.");
        setFilePath([]);
      } else {
        console.error("Error fetching module details:", err);
        setError("Failed to fetch module details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle module selection change
  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId);
    fetchModuleDetails(moduleId);
  };

  // Render file paths
  const renderFilePaths = () => {
    if (!filePath || filePath.length === 0) {
      return <p>No files uploaded for this module.</p>;
    }
    
    return filePath.map((file, index) => (
      <div key={index}>
        <a
          href={`http://localhost:3000/${file}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {file.split('/').pop()}
        </a>
      </div>
    ));
  };

  // Fetch notes for the selected module
  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedModule || !course?._id) return;

      try {
        setLoading(true);
        setError(null);

        const notesResponse = await axios.get(
          `http://localhost:3000/notes/${course._id}/${selectedModule}`,
          { withCredentials: true }
        );

        if (notesResponse.data && Array.isArray(notesResponse.data)) {
          setNotes(notesResponse.data);
        }
      } catch (err: any) {
        console.error("Error fetching notes:", err);
        setError(err.response?.data?.message || "Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [selectedModule, course?._id]);

  // Handle quick note submission
  const handleQuickNoteSubmit = async () => {
    if (!newNote.trim() || !selectedModule || !course?._id) {
      setError("Note content cannot be empty and module must be selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `http://localhost:3000/notes`,
        {
          title: "Quick Note",
          content: newNote,
          studentId: course._id,
          moduleId: selectedModule,
        },
        { withCredentials: true }
      );

      if (response.data) {
        setNotes((prevNotes) => [...prevNotes, response.data]);
        setNewNote("");
      }
    } catch (err: any) {
      console.error("Error submitting note:", err);
      setError(err.response?.data?.message || "Failed to save the note");
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a note
  const handleEditNote = async (noteId: string) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:3000/notes/${noteId}`,
        { content: editedContent },
        { withCredentials: true }
      );

      if (response.data) {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === noteId ? { ...note, content: editedContent } : note
          )
        );
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

  // Handle deleting a note
  const handleDeleteNote = async (noteId: string) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/notes/${noteId}`, {
        withCredentials: true,
      });

      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
    } catch (err: any) {
      console.error("Error deleting note:", err);
      setError(err.response?.data?.message || "Failed to delete the note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center py-4">
          <h1 className="h3">{course.title}</h1>
        </div>

        <div className="card-body">
          {/* Modules Section */}
          <div className="mb-4">
            <h2 className="h5">{course.description}</h2>
            <div className="mb-4">
            <h2 className="h5">COURSE MODULES</h2>
            {modules && modules.length > 0 ? (
              <Accordion modules={modules} isGuest={false} isInstructor={false} isStudent={true} />
            ) : (
              <p style={{ fontFamily: "CustomFont2" }} className="text-muted">No modules available for this course.</p>
            )}
          </div>  
        </div>
      </div>
    </div>
    </div>
  );
};

export default StudentCourseDetails;
