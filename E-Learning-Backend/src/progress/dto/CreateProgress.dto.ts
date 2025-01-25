import { IsDate, IsDateString, IsDecimal, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";

export class CreateProgressDto{

    @IsNotEmpty()
    @IsMongoId()
    user_id: string;

    @IsNotEmpty()
    @IsMongoId()
    course_id: string;

    @IsNotEmpty()
    @IsNumber()
    completion_percentage: number;

    @IsNotEmpty()
    @IsDateString()
    last_accessed: Date;
}