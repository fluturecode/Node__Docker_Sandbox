import { IsString, IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Agency, Role } from "@models";

export class UserCreationDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  profilePicture: string;

  @ApiProperty()
  @IsNotEmpty()
  role: Role;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  agency: Agency;
}