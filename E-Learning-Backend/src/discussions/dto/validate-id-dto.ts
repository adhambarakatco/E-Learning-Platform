import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class ValidateIdDto {
    @IsString()
    @IsMongoId()
    id: string;
}