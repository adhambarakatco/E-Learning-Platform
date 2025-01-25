import { IsMongoId, IsNotEmpty, IsString } from "class-validator";


export class CreatePlatformAnnouncementDto{
    
    @IsNotEmpty()
    @IsString()
    content: string;
    
    @IsNotEmpty()
    @IsMongoId()
    admin: string;
   

}