import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;

  @IsNotEmpty()
  @IsEnum(['student', 'instructor'], { message: 'Role must be either student or instructor' })
  readonly role: string;

}