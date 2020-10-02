import { IsString, IsNotEmpty, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ValidPassword } from "@consts/validation.consts";

export class UserResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(
    ValidPassword.validation,
    {
      message: ValidPassword.message
    }
  )
  confirmPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(
    ValidPassword.validation,
    {
      message: ValidPassword.message
    }
  )
  newPassword: string;
}