import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { User } from '../entities/user/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  @ApiResponse({ status: 201, description: 'New user created successfully' })
  @ApiResponse({ status: 400, description: 'Error with user payload' })
  @Post('signup')
  async signup(
    @Body(ValidationPipe) userSignupPayload: UserSignupDto
  ): Promise<Partial<User>> {
    return this.userService.signUp(userSignupPayload);
  }
}
