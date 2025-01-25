import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  studentId: mongoose.Schema.Types.ObjectId; // Reference to the user

  @Prop({ required: true })
  moduleId: mongoose.Schema.Types.ObjectId; // Reference to the module
}

export const NoteSchema = SchemaFactory.createForClass(Note);
