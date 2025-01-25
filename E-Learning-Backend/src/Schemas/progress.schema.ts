import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './users.schema'; // Import User schema
import { Course } from './courses.schema'; // Import Course schema

export type ProgressDocument = Progress & Document;

@Schema()
export class Progress {

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
  user_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true 
  })
  course_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ required: true })
  completion_percentage: number; 

  @Prop({ required: true })
  last_accessed: Date; 
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
