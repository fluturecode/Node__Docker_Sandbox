import { User } from '@entities/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class JwtResponseDto {
  @ApiProperty()
  @IsString()
  jwt_token: string;

  @ApiProperty()
  user: User;

  constructor(jwtResponse: JwtResponseDto) {
    return Object.assign(this, jwtResponse);
  }
}