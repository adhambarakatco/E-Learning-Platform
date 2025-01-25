import { IsNotEmpty, IsString } from "class-validator";

export class MessageDto{
    
    @IsNotEmpty()
    @IsString()
    sender: string;

    @IsNotEmpty()
    @IsString()
    chat: string;

    @IsNotEmpty()
    content: string
}