import { Controller, Post, Body, ValidationPipe, Req, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { User } from '../entities/user/user.entity';
import { UserService } from './user.service';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import { UserForgotPasswordDto } from './dto/user-forgot-password.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  @ApiResponse({ status: 200, description: 'Generic success response to prevent phising attempts' })
  @ApiBody({ type: UserForgotPasswordDto })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body(ValidationPipe) userForgotPasswordPayload: UserForgotPasswordDto
  ): Promise<{message: string}> {
    return this.userService.sendResetPasswordEmail(userForgotPasswordPayload.email);
  }

  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Password reset payload error' })
  @ApiResponse({ status: 401, description: 'Invalid password reset token' })
  @ApiBody({ type: UserResetPasswordDto })
  @Put('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body(ValidationPipe) userResetPasswordPayload: UserResetPasswordDto
  ): Promise<{message: string}> {
    return this.userService.resetUserPassword(token, userResetPasswordPayload);
  }

  @ApiResponse({ status: 201, description: 'New user created successfully' })
  @ApiResponse({ status: 400, description: 'Error with user payload' })
  @Post('signup')
  async signup(
    @Body(ValidationPipe) userSignupPayload: UserSignupDto
  ): Promise<Partial<User>> {
    return this.userService.signUp(userSignupPayload);
  }
}
