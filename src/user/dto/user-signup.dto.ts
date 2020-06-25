import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidPassword } from '@consts/validation.consts';

export class UserSignupDto {
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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  last_name: string;
}