import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import exp from "constants";
import mongoose from "mongoose";
import { Course } from "src/Schemas/courses.schema";
import { User } from "src/Schemas/users.schema";


export type CourseAnnouncementDocument = CourseAnnouncement & Document;

@Schema({ timestamps: true , collection: 'course_announcements' })
export class CourseAnnouncement {
    
    @Prop({required : true})
    content: string;
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    instructor: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
    course: Course;

}

export const CourseAnnouncementSchema = SchemaFactory.createForClass(CourseAnnouncement);

