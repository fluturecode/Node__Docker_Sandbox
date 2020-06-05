import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class UserResetPasswordDto {
  @ApiProperty()
  @IsString()
  confirm_password: string;

  @ApiProperty()
  @IsString()
  new_password: string;
}