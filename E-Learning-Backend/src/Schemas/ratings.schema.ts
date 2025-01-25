import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RatingsDocument = Rating & Document;

@Schema()
export class Rating {
    @Prop({ required: true }) 
    rating: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    rater_id: mongoose.Schema.Types.ObjectId; // Reference to User schema

    @Prop({ type:mongoose.Schema.Types.ObjectId,required: false, ref: 'Module' })
    module_id: mongoose.Schema.Types.ObjectId; 

    @Prop({ type:mongoose.Schema.Types.ObjectId,required: false, ref: 'User' })
    ratee_id: mongoose.Schema.Types.ObjectId; 
}

export const RatingSchema = SchemaFactory.createForClass(Rating)