import { IsString, IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@models";

export class UserUpdateDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  profilePicture: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  role: Partial<Role>;
}