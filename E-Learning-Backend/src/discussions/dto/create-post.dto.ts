import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto{
    
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsMongoId()
    author: string;

    @IsNotEmpty()
    @IsMongoId()
    course: string;

}