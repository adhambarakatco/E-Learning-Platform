import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CourseDocument = Course & Document;

export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

@Schema({ timestamps: true })
export class Course {


  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: DifficultyLevel })
  level: DifficultyLevel;

  @Prop({ required: false })
  created_by: string;

  @Prop({ type: [Object], default: [] })
  versions: any[];

  @Prop({ required: false })
  versionNumber: number;

  @Prop({ ref: 'User', required:true})
  userId:  mongoose.Schema.Types.ObjectId;
  
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
  students: mongoose.Types.ObjectId[];

  @Prop({ default: true })
  isAvailable: boolean;
  
  @Prop({default:[]})
  keywords: string[]
    
}
export const CourseSchema = SchemaFactory.createForClass(Course);