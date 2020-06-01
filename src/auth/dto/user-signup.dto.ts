import { IsString, MinLength, Matches } from "class-validator";

const includesOneUpperLowerSpecialCharAndNumber: RegExp = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export class UserSignupDto {
  @IsString()
  @MinLength(5)
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(
    includesOneUpperLowerSpecialCharAndNumber,
    {
      message: 'Password needs to include 1 uppercase letter, 1 lowercase letter and 1 number or special character.'
    }
  )
  password: string;

  @IsString()
  @MinLength(1)
  first_name: string;

  @IsString()
  @MinLength(1)
  last_name: string;
}