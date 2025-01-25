import { IsString, IsArray, IsNumber, IsNotEmpty } from 'class-validator';
import { QuestionBank } from 'src/Schemas/QuestionBank.schema';

export class createQuizzesDTo {
    @IsString()
    @IsNotEmpty()
    module_id: string;

   
    questionsA: QuestionBank[];

    
    questionsB: QuestionBank[];

   
    questionsC: QuestionBank[];

    @IsNumber()
    numOfQuestions: number;

    @IsArray()
    @IsNotEmpty({ each: true })
    typeOfQuestions: string[];
}
