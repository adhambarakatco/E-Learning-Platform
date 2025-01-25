import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Post } from "./post.Schema";
import { User } from "src/Schemas/users.schema";

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {

    @Prop({required: true})
    content: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true})
    post: Post;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    author: User;

}

export const CommentSchema = SchemaFactory.createForClass(Comment);
