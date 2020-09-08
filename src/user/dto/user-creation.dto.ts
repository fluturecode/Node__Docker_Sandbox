import { IsString, IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Agency, Role } from "@entities";

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
  role: Partial<Role>;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  agency: Partial<Agency>;
}