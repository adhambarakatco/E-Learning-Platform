import { IsString, IsArray, IsNotEmpty, IsIn } from 'class-validator';


export class updateQuestionsDTo {
    @IsString()
    @IsNotEmpty()
    module_id: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsArray()
    @IsNotEmpty({ each: true })
    options: string[];

    @IsString()
    @IsNotEmpty()
    correct_answer: string;

    @IsString()
    @IsIn(['A', 'B', 'C'], { message: 'Difficulty must be one of A, B, or C' })
    difficulty: string;

    @IsString()
    @IsNotEmpty()
    question_text: string;
}