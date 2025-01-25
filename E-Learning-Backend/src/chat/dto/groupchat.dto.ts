import { IsNotEmpty, IsString, IsArray, ArrayMinSize } from "class-validator";

export class GroupChatDto{
    
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsArray()
    @ArrayMinSize(3)
    @IsNotEmpty({ each: true})
    users: string[];

}