import { IsString, MinLength, Matches, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ValidPassword } from "@consts/validation.consts";

export class UserCredentialsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    ValidPassword.validation,
    {
      message: ValidPassword.message
    }
  )
  password: string;
}