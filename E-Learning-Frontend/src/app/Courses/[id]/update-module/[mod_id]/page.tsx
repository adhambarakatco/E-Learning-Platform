'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Module } from "@/app/types/Module";

const UpdateModulePage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [red, setRed] = useState<boolean | null>(null);
  const [moduleData, setModuleData] = useState<Module>();
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);  // Store deleted file paths

  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const moduleId = params.mod_id;

  // Fetch current module data when the page loads
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/courses/${courseId}/modules/${moduleId}`,{
          withCredentials:true
        });
        
        setModuleData(response.data);
      } catch (error) {
        console.error("Error fetching module data:", error);
        setMessage("Error fetching module data.");
        setRed(true);
      }
    };
    fetchModuleData();
  }, [moduleId, courseId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const title = e.currentTarget.id1.value;
    const content = e.currentTarget.content.value;
    const resources = e.currentTarget.resources.value;
    const files = e.currentTarget.files.files;


    const formData = new FormData();

    formData.append('title', title);
    formData.append('resources', resources);
    formData.append('content', content);
    formData.append('courseId', courseId as string);
    
    // Append each file to formData
    for (let i = 0; i < files.length; i++) {
      
      
      formData.append('files', files[i]);
    }


    deletedFiles.forEach((filePath) => {
      formData.append('deletedFiles[]', filePath);
    });




    try {
      const response = await axios.put(`http://localhost:3000/courses/${courseId}/modules/${moduleId}`,
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setMessage("Module updated successfully");
        setRed(false);
        // setTimeout(() => {
        //   router.push(`/modules/${moduleId}`);
        // }, 2000);
      }
    } catch (error: any) {
      console.error("Error updating module:", error);
      setMessage(error.response?.data?.message || "An error occurred while updating the module");
      setRed(true);
    } finally {
      setLoading(false);
    }
  };

  const  handleDeleteFile = async (filePath: string) => {
      try{
      const response = await axios.delete(
        // `http://localhost:3000/courses/${courseId}/modules/${moduleId}/files`, 
        // { 
        //   data: { deleted: [filePath] }  // Send 'deleted' in the body of the DELETE request
        // }
        // add withCredentials: true
        `http://localhost:3000/courses/${courseId}/modules/${moduleId}/files`,
        {
          data: { deleted: [filePath] },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage("File deleted successfully");
        setRed(false);
      }
    }

 catch (error: any) {
    console.error("Error deleting file", error);
    setMessage(error.response?.data?.message || "An error occurred while updating the module");
    setRed(true);
  } finally {
    setLoading(false);
  }
      
  
      

   
  };

  return (
    <>
      <style>{`
        body {
          background-color: #31087b;
          font-family: 'CustomFont', sans-serif;
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <div className="container py-5">
        <div className="card shadow-lg">
          {/* Header Section */}
          <div className="card-header bg-primary text-white text-center py-4">
            <h1 className="h3" style={{ fontFamily: "CustomFont, sans-serif" }}>
              Update Module
            </h1>
          </div>

          {/* Content Section */}
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Title Section */}
              <div className="mb-4">
                <h2 className="h5">Module Title</h2>
                <textarea
                  id="id1"
                  name="id1"
                  className="form-control"
                  rows={1}
                  style={{ fontFamily: "CustomFont2" }}
                  required
                  defaultValue={moduleData?.title}
                />
              </div>

              {/* Description Section */}
              <div className="mb-4">
                <h2 className="h5">Module Content</h2>
                <textarea
                  id="content"
                  name="content"
                  className="form-control"
                  rows={2}
                  style={{ fontFamily: "CustomFont2" }}
                  required
                  defaultValue={moduleData?.content}
                />
              </div>

              
              <div className="mb-4">
                <h2 className="h5">Resources</h2>
                <input
                  type="resources"
                  id="resources"
                  name="resources"
                  className="form-control"
                  style={{ fontFamily: "CustomFont2" }}
                  required
                  defaultValue={moduleData?.resources}
                />
              </div>

              {/* Uploaded Files Section */}
              <div className="mb-4">
                <h2 className="h5">Uploaded Files</h2>
                {moduleData?.filePath && moduleData.filePath.length > 0 ? (
                  <ul className="list-group">
                    {moduleData.filePath.map((filePath, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <a href={filePath} target="_blank" rel="noopener noreferrer">
                          {filePath}
                        </a>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFile(filePath)} >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No files uploaded</p>
                )}
              </div>


              <div className="mb-4">
              <h2 className="h5">UPLOAD FILES</h2>
              <input
                type="file"
                id="files"
                name="files"
                className="form-control"
                multiple
                style={{fontFamily:"CustomFont2"}}
              />
              <small className="text-muted" style={{fontFamily:"CustomFont2"}}>
                You can upload multiple files (PDFs, videos, etc.)
              </small>
            </div>



              {/* Message Box */}
              {message && (
                <div className={`alert ${red ? "alert-danger" : "alert-success"} mt-4`} role="alert">
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <div className="d-flex gap-3">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Module"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push(`/dashboard`)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateModulePage;
