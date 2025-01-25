import { IsNotEmpty, IsString, IsEnum, IsDateString, IsArray } from 'class-validator';
import { DifficultyLevel } from '../../Schemas/courses.schema';
import mongoose from 'mongoose';

export class CreateCourseDto {


  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsEnum(DifficultyLevel)
  level: DifficultyLevel;
}
