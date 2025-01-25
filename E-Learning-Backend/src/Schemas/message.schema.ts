import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class Message {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId; 

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  chat: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  sentAt: Date;
  
}
export const MessageSchema = SchemaFactory.createForClass(Message);