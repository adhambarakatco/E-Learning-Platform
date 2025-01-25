"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ProgressBar from "@/components/ui/ProgressBar";

export default function StudentProgressReport() {
  const [courseId, setCourseId] = useState("");
  const [studentReport, setStudentReport] = useState<any>(null);
  const [courseRatings, setCourseRatings] = useState<any[]>([]);
  const [averageScores, setAverageScores] = useState<any[]>([]);
  const [student, setStudent] = useState({ id: "", gpa:0});
  const [courseScores, setCourseScores] = useState<{ course: string; averageScore: number }[]>([]);
  const [averageCompletion, setAverageCompletion] = useState<number>(0);
  const [engagementTrend, setEngagementTrend] = useState<any[]>([]);
  const [rateeType, setRateeType] = useState("");
  const [rating, setRating] = useState(0);
  const [rateeId, setRateeId] = useState("");
  const [studentId, setStudentId] = useState(""); 
  const [quizScores, setQuizScores] = useState<{ 
    quiz_id: number,
    score: string }[]>([]);

  useEffect(() => {
    // make async call to fetch from auth/userData
    const fetchStudentData = async () => {  
      try {
        const response = await axios.get("http://localhost:3000/auth/userData", {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        ;
        if (response.data)
          setStudentId(response.data._id);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;          
        }

      }

    }

    fetchStudentData();
    if (studentId === "") return;
    fetchAverageScores();
    fetchAverageCompletion();
    fetchQuizScores();
  }, [studentId]);

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
  
  const fetchAverageScores = async () => {
    try {
      const response = await axios.get("http://localhost:3000/progress/averageScores/student", {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setStudent(response.data.student);
      setCourseScores(response.data.courseScores);
    } catch (error) {
         if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;
         }
    }
  };

  const fetchAverageCompletion = async () => {
    try {
      const response = await axios.get("http://localhost:3000/progress/averageCompletionPercentage", {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setAverageCompletion(response.data);
    } catch (error) {
      console.error("Error fetching average completion:", error);
    }
  }

  const fetchCourseCompletion = async (courseId: string) => {
      try {
        const response = await axios.get(`http://localhost:3000/progress/courseId?courseId=${courseId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        const response2 = await axios.get(`http://localhost:3000/progress/engagement?courseId=${courseId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        setAverageCompletion(response.data);
        setEngagementTrend(response2.data.quizzesLeft);
      } catch (error) {
        console.error("Error fetching course completion:", error);
      }
    }

  const submitRating = async (ratee: string) => {
    try {
      if(ratee === "instructor") {
        const response = await axios.post("http://localhost:3000/progress/rate-instructor", 
          JSON.stringify({courseId: rateeId, rating: rating}),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
      } else {
        const response = await axios.post("http://localhost:3000/progress/rate-module", 
          JSON.stringify({moduleId: rateeId, rating: rating}),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching average completion:", error);
    }
  }

  const fetchQuizScores = async () => {
    try { 
      ;
      const response = await axios.get(`http://localhost:3000/responses/user/${studentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      ;
      setQuizScores(response.data);
      ;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;
        }
    }
  }

  return (
    <div id='downloadable-section'style={styles.container}>
      <button onClick={downloadAsPDF}>Download</button>
      <div style={styles.grid}>
        <div style={styles.box}>
          <h2 style={styles.title}>Student Report</h2>
          <div style={styles.info}>
            <p>GPA: {student.gpa}</p>
            <p>Scores:</p>
            <ul>
              {courseScores.map((course, index) => (
                <li key={index}>
                  {course.course}: {course.averageScore}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={styles.box}>
          <h2 style={styles.title}>Course Completion</h2>
          <ProgressBar value={averageCompletion} />
          <input
            type="text"
            id="courseId"
            placeholder="Enter Course ID"
            style={styles.input}
            onChange={(e) => fetchCourseCompletion((e.target as HTMLInputElement).value)}
          />
          <p style={styles.info}>Modules left: {engagementTrend}</p>
        </div>
        <div style={styles.box}>
          <h2 style={styles.title}>Rating</h2>
          <button style={styles.button} onClick={() => setRateeType("instructor")}>Rate Instructor</button>
          <button style={styles.button} onClick={() => setRateeType("module")}>Rate Module</button>
          {rateeType === "instructor" && (
            <div>
              <input type="text" placeholder="Enter Instructor ID" style={styles.input} onChange={(e) => setRateeId((e.target as HTMLInputElement).value)} />
              <input type="number" placeholder="Enter Rating" style={styles.input} onChange={(e) => setRating(Number((e.target as HTMLInputElement).value))}/>
              <button style={styles.button} onClick={() => submitRating(rateeType)}>Submit</button>
            </div>
          )}
          {rateeType === "module" && (
            <div>
              <input type="text" placeholder="Enter Module ID" style={styles.input} onChange={(e) => setRateeId((e.target as HTMLInputElement).value)} />
              <input type="number" placeholder="Enter Rating" style={styles.input} onChange={(e) => setRating(Number((e.target as HTMLInputElement).value))}/>
              <button style={styles.button} onClick={() => submitRating(rateeType)}>Submit</button>
            </div>
          )}

        </div>
        <div style={styles.box}>
         <h2 style={styles.title}>Quiz Scores</h2>
         <ul>
            {quizScores.map((quiz: { quiz_id: any; score: string }, index: number) => (
                <li key={index}>
                <p>Quiz ID: {quiz && quiz.quiz_id && quiz.quiz_id._id}</p>
                <p>Score: {quiz.score}</p>
              </li>
            ))}
         </ul>
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
    gridTemplateColumns: "1fr",
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
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    width: "80%",
  },
  button: {
    padding: "10px 20px",
    margin: "10px 0",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  info: {
    textAlign: "left" as "left",
  },
};

function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
// Removed the incorrect html2canvas function implementation

