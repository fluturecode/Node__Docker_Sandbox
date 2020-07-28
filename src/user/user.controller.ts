import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserCreationDto } from './dto/user-creation.dto';
import { User, UserRoles } from '@entities';
import { UserService } from './user.service';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import { UserForgotPasswordDto } from './dto/user-forgot-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasRoleGuard } from '@guards';
import { RequiredRoles } from '@decorators';

import { GetCurrentUser } from '@decorators';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Users fetched successfully', type: User, isArray: true })
  @ApiResponse({ status: 401, description: 'Invalid authorization token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @RequiredRoles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
  @UseGuards(JwtAuthGuard, HasRoleGuard)
  @Get('')
  async getAllUsers(
    @GetCurrentUser() user: User,
  ): Promise<User[]> {
    return this.userService.getAllUsers(user.role);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'New user created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Error with user payload' })
  @ApiResponse({ status: 401, description: 'Invalid authorization token' })
  @RequiredRoles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
  @UseGuards(JwtAuthGuard, HasRoleGuard)
  @Post('')
  async createUser(
    @GetCurrentUser() user: User,
    @Body(ValidationPipe) userCreationPayload: UserCreationDto
  ): Promise<User> {
    return this.userService.createUser(userCreationPayload, user);
  }

  @ApiResponse({ status: 200, description: 'Password reset successful', type: User })
  @ApiResponse({ status: 400, description: 'Password reset payload error' })
  @ApiResponse({ status: 401, description: 'Invalid password reset token' })
  @ApiBody({ type: UserResetPasswordDto })
  @Put('activate-account/:token')
  async activateAccount(
    @Param('token') token: string,
    @Body(ValidationPipe) userActivation: UserResetPasswordDto
  ): Promise<User> {
    return this.userService.activateUserAccount(token, userActivation);
  }

  @ApiResponse({ status: 200, description: 'Generic success response to prevent phising attempts' })
  @ApiBody({ type: UserForgotPasswordDto })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body(ValidationPipe) userForgotPasswordPayload: UserForgotPasswordDto
  ): Promise<{message: string}> {
    return this.userService.sendResetPasswordEmail(userForgotPasswordPayload.email);
  }

  @ApiResponse({ status: 200, description: 'Password reset successful', type: User })
  @ApiResponse({ status: 400, description: 'Password reset payload error' })
  @ApiResponse({ status: 401, description: 'Invalid password reset token' })
  @ApiBody({ type: UserResetPasswordDto })
  @Put('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body(ValidationPipe) userResetPasswordPayload: UserResetPasswordDto
  ): Promise<User> {
    return this.userService.resetUserPassword(token, userResetPasswordPayload);
  }

  @ApiResponse({ status: 201, description: 'New user created successfully', type: UserSignupDto })
  @ApiResponse({ status: 400, description: 'Error with user payload' })
  @Post('signup')
  async signup(
    @Body(ValidationPipe) signupPayload: UserSignupDto
  ): Promise<User> {
    return this.userService.signUp(signupPayload);
  }
}
