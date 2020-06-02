import { IsString, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

const includesOneUpperLowerSpecialCharAndNumber: RegExp = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export class UserSignupDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(
    includesOneUpperLowerSpecialCharAndNumber,
    {
      message: 'Password needs to include 1 uppercase letter, 1 lowercase letter and 1 number or special character.'
    }
  )
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  first_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  last_name: string;
}