import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "src/Schemas/users.schema";


export type PlaformAnnouncementDocument = PlatformAnnouncement & Document;

@Schema({ timestamps: true , collection: 'platform_announcements' })
export class PlatformAnnouncement {
    
    @Prop({required : true})
    content: string;
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    admin: User;

}

export const PlatformAnnouncementSchema = SchemaFactory.createForClass(PlatformAnnouncement);

