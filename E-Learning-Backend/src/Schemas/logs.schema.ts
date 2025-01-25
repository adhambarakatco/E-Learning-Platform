import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LogType {
    FAILED_LOGIN = 'failed_login',
    UNAUTHORIZED_ACCESS = 'unauthorized_access'
}

@Schema({ timestamps: true })
export class Log extends Document {
    @Prop({ required: true, enum: LogType })
    type: LogType;

    @Prop()
    email?: string;

    @Prop()
    message: string;

    @Prop()
    endpoint?: string;
}

export const LogSchema = SchemaFactory.createForClass(Log); 