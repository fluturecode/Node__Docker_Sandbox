import { Controller, UseGuards, Post, Request, Get, Body, ValidationPipe } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserSignupDto } from './dto/user-signup.dto';
import { User } from 'src/entities/user/user.entity';
import { AuthService } from './auth.service';

import { UserCredentialsDto } from './dto/user-credentials.dto';
import { ApiBody, ApiBearerAuth, ApiHeader, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @ApiResponse({ status: 200, description: 'Login was successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: UserCredentialsDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @ApiResponse({ status: 201, description: 'New user created successfully' })
  @ApiResponse({ status: 400, description: 'Error with user payload' })
  @Post('signup')
  async signup(
    @Body(ValidationPipe) userSignupPayload: UserSignupDto
  ): Promise<User> {
    return this.authService.signUp(userSignupPayload);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logout was successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiHeader({ name: 'Authorization', description: 'JWT Token' })
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req): Promise<string> {
    return this.authService.logout(req.user.email);
  }
}
