import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollStudentDto {
  @IsNotEmpty()
  @IsString()
  courseId: string; // The ID of the course

  // @IsNotEmpty()
  // @IsString()
  // studentId: string; // The ID of the student to be enrolled

  // @IsNotEmpty()
  // @IsString()
  // instructorId: string; // The ID of the instructor enrolling the student
}
