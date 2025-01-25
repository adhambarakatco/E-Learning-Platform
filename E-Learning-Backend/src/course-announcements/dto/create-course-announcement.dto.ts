import { IsMongoId, IsNotEmpty, IsString } from "class-validator";


export class CreateCourseAnnouncementDto{
    
    @IsNotEmpty()
    @IsString()
    content: string;
    
    @IsNotEmpty()
    @IsMongoId()
    instructor: string;
    
    @IsNotEmpty()
    @IsMongoId()
    course: string;

}