import { IsArray, IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

export class createResponseDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: ObjectId; 

  @IsMongoId()
  @IsNotEmpty()
  quiz_id: string; 

  @IsArray()
  @IsNotEmpty()
  @Type(() => AnswerDto)
  answers: AnswerDto[]; 
  
}

class AnswerDto {
  @IsMongoId()
  @IsNotEmpty()
  question_id: string;

  @IsString()
  @IsNotEmpty()
  user_answer: string; 
}
