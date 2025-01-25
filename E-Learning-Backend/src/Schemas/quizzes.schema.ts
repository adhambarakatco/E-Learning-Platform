import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionBank } from './QuestionBank.schema';
export type QuizDocument = HydratedDocument<Quiz>;

@Schema()
export class Quiz {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Module',unique: true, required: true })
  module_id: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }], required: true })
    questionsA: mongoose.Types.ObjectId[] | QuestionBank[];
  
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }], required: true })
    questionsB: mongoose.Types.ObjectId[] | QuestionBank[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }], required: true })
    questionsC: mongoose.Types.ObjectId[] | QuestionBank[];

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop({ type: [String], required: true })
  typeOfQuestions: string[];

  @Prop({ required: true })
  numOfQuestions: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);