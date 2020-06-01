import { IsString, MinLength, MaxLength } from "class-validator";



export class UserCredentialsDto {
  @IsString()
  @MinLength(5)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}