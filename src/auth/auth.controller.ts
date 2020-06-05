import { Controller, UseGuards, Post, Request, Get, HttpCode } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  @HttpCode(200)
  async login(@Request() req) {
    return req.user;
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logout was successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiHeader({ name: 'Authorization', description: 'JWT Token' })
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req): Promise<{message: string}> {
    return this.authService.logout(req.user.email);
  }
}
