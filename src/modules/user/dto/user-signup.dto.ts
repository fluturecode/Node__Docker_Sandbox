import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  lastName: string;
}