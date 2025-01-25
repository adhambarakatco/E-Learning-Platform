import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Course } from "src/Schemas/courses.schema";
import { User } from "src/Schemas/users.schema";

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {

    @Prop({required: true})
    title: string;
    
    @Prop({required : true})
    content: string;
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    author: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
    course: Course;

}

export const PostSchema = SchemaFactory.createForClass(Post);
