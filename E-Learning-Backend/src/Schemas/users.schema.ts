
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
export type UserDocument = HydratedDocument<User>;

export enum Role {
  Student = 'student',
  Instructor = 'instructor',
  Admin = 'admin',
}

@Schema({ timestamps: true })
export class User {

  _id: mongoose.Schema.Types.ObjectId;
  
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Role })
  role: Role;
  
  @Prop({required:true})
  gpa: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Course', default: [] })
  enrolledCourses: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Course', default: [] })
  createdCourses: mongoose.Schema.Types.ObjectId[];

  @Prop({default:true})
  setActive:boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);
