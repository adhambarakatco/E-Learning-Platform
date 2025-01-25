import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './users.schema';
import { Course } from './courses.schema';
export type ModuleDocument = Document & Module;

@Schema({ timestamps: true }) // Enable automatic timestamp handling
export class Module {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  course_id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop()
  filePath: string[];

  @Prop({default: false})
  outdated: boolean;

  @Prop({ type: [String] })
  resources: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  uploaded_by: mongoose.Types.ObjectId; // Reference to the user who uploaded the module
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
