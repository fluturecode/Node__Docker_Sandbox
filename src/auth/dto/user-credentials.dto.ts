import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserCredentialsDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}