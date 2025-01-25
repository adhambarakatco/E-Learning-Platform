import { IsMongoId, IsNotEmpty, IsString } from "class-validator";


export class CreateCommentDto{

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsMongoId()
    post: string;

    @IsNotEmpty()
    @IsMongoId()
    author: string;
}