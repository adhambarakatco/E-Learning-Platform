import { Schema, Types } from 'mongoose';

export const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
  created_by: { type: String, required: true },
  instructorId: { type: Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Types.ObjectId, ref: 'User', default: [] }],
  versions: [{
    versionNumber: Number,
    title: String,
    description: String,
    createdAt: Date,
  }],
}, { timestamps: true });
