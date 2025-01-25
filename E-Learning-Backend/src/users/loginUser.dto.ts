import { IsEmail, IsString, IsNotEmpty} from 'class-validator';

export class LoginUserDTO {

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  
  @IsString()
  @IsNotEmpty()
  readonly password: string;
  
}