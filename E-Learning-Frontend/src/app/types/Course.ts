export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export interface Course {
  _id: string; 
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_by: string;
  versionNumber: number;
  userId: string; 
  students: string[]; 
  isAvailable: boolean; 
  keywords: string[]; 
  instructor_details: Instructor[]; 
  created_at?: string; 
  updated_at?: string; 
  DifficultyLevel: DifficultyLevel; // Enum value for the difficulty level
}

export interface Instructor {
  _id: string; // Instructor's ObjectId
  name: string; // Instructor's name
  email: string; // Instructor's email
  password: string; // Hashed password (it should ideally not be part of the frontend model)
  role: string; // Instructor's role (e.g., 'instructor')
  gpa: number; // Instructor's GPA (assuming it's part of the user schema)
  enrolledCourses: string[]; // List of enrolled courses (if applicable)
  courses: Course[]; // List of created courses (if applicable)
  createdAt: string; // Date the instructor was created
  updatedAt: string; // Date the instructor was last updated
  __v: number; // Version key used by MongoDB for internal tracking
}
