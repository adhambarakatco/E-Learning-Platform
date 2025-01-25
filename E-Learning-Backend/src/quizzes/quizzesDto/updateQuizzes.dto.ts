import { IsString, IsArray, IsNumber, IsNotEmpty } from 'class-validator';
import { QuestionBank } from 'src/Schemas/QuestionBank.schema';

export class updateQuizzesDTo {
    
    module_id: string;

   
    questionsA: QuestionBank[];

    
    questionsB: QuestionBank[];

    
    questionsC: QuestionBank[];

    @IsNumber()
    numOfQuestions: number;

    
    typeOfQuestions: string[];
}