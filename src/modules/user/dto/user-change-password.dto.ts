import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserResetPasswordDto } from "./user-reset-password.dto";

export class UserChangePasswordDto extends UserResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oldPassword: string;
}