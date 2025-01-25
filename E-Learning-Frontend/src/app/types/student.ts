import { Course } from "./Course";
export  interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  gpa: number;
  enrolledCourses:  string[];
  courses : Course[]
}