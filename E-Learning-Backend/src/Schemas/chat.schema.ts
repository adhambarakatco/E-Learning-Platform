import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class Chat {

  @Prop({ required: true, validate: (val : Types.ObjectId[]) => val.length > 1 })
  users: Types.ObjectId[]; 

  @Prop({ required: true })
  messages: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true, enum: ['private', 'group'], default: 'private' })
  chatType: string;

  @Prop({
    type: String,
    validate: {
      validator: function (this: Chat) {
        return this.chatType === 'group' ? this.name && this.name.trim() !== '' : true;
      },
      message: 'Name is required for group chats.',
    },
  })
  name?: string;

}

export const ChatSchema = SchemaFactory.createForClass(Chat);