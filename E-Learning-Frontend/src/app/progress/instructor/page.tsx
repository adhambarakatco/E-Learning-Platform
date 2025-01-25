"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import CircularProgressBar from "@/components/ui/CirculaProgressBar";
import { set } from "mongoose";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function StudentProgressReport() {
  const [averageScores, setAverageScores] = useState<any[]>([]);
  const [engagementReport, setEngagementReport] = useState<{ 
      Total: number,
      Below_Average: number,
      Average: number,
      Above_Average: number,
      numCompleted: number; averageScore: number } | null>(null);
  const [courseRating, setCourseRating] = useState<{ 
    course_id: string,
    course_title: string,
    averageRating: number} | null>(null);

  const [moduleRatings, setModuleRatings] = useState<{
    module_id: string,
    module_rating: number
  }[]>([]);


  useEffect(() => { 
    fetchAverageScores();
    downloadAsPDF();
  }, []);

  const fetchAverageScores = async () => {
    try {
      const response = await axios.get("http://localhost:3000/progress/averageScore/instructor", {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setAverageScores(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setAverageScores([]);
        return
      }
    }
  };

  const fetchEngagementReport = async (courseId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/progress/studentEngagementReport?courseId=${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setEngagementReport(response.data);
    } catch (error) {
      console.error("Error fetching engagement report:", error);
    }
  }

  const fetchCourseRating = async (courseId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/progress/course-rating?courseId=${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setCourseRating(response.data);
      fetchModuleRatings(courseId);
    } catch (error) {
      console.error("Error fetching course rating:", error);
    }
  }

  const fetchModuleRatings = async (courseId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/progress/moduleRatings?courseId=${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setModuleRatings(response.data);
    } catch (error) {
      console.error("Error fetching module ratings:", error)
    }
  }

  const downloadAsPDF = async () => {
    const element = document.getElementById("downloadable-section");
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("download.pdf");
    }
  };

  return (
    <div id='downloadable-section' style={styles.container}>
      <button onClick={downloadAsPDF}>Download</button>
      <div style={styles.grid}>
        <div style={styles.box}>
          <h2 style={styles.title}>Average Scores</h2>
          <ul>
            {averageScores.map((score) => (
              <div key={score.course}>
                <p>{score.course}</p>
                <CircularProgressBar value={score.avg} />
              </div>
            ))}
          </ul>
        </div>
        <div style={styles.box}>
          <h2 style={styles.title}>Student Engagement Report</h2>
          <input type="text" id="courseId" placeholder="Enter Course ID" style={styles.inputSmall} onInput={(e) => fetchEngagementReport((e.target as HTMLInputElement).value)}/>
            <ul>
              <p>Enrolled Students</p>
              {engagementReport && (
                <>
                  <p>Total: {engagementReport.Total}</p>
                  <p>Below Average: {engagementReport.Below_Average}</p>
                  <p>Average: {engagementReport.Average}</p>
                  <p>Above Average: {engagementReport.Above_Average}</p>
                  <p>Number of students who completed the course: {engagementReport.numCompleted}</p>
                  <p>Average Score: {engagementReport.averageScore}</p>
                </>
              )}
            </ul>
        </div>
        <div style={styles.box}>
         <h2 style={styles.title}>Course Rating</h2>
         <input type="text" id="courseId" placeholder="Enter Course ID" style={styles.inputSmall} onInput={(e) => fetchCourseRating((e.target as HTMLInputElement).value)}/>
         <div>{courseRating && (
                <>
                  <p>Course ID: {courseRating.course_id} </p>
                  <p>Course Title: {courseRating.course_title} </p>
                  <p>Average Rating: {courseRating.averageRating} </p>
                </>
              )}</div>
          <div>{moduleRatings.map((module, index) => (
                <li key={index}>
                  <p>Module ID: {module.module_id}</p>
                  <p>Module Rating: {module.module_rating}</p>
                </li>
              ))}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center" as "center",
    backgroundColor: "#0000ff",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    padding: "20px",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  box: {
    backgroundColor: "#ff00ff",
    padding: "20px",
    borderRadius: "10px",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "20px",
  },
  progressBar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    margin: "0 auto",
    background: "conic-gradient(#fff 0% 0%, transparent 0%)",
  },
  searchContainer: {
    gridColumn: "span 2",
    margin: "20px 0",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    width: "80%",
  },
  info: {
    textAlign: "left" as "left",
  },
  rateSection: {
    marginTop: "20px",
    gridColumn: "span 2",
  },
  buttons: {
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    margin: "5px",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  inputSmall: {
    padding: "10px",
    margin: "5px",
    borderRadius: "5px",
    border: "none",
    width: "calc(50% - 12px)",
  },
};