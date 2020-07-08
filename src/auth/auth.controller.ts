import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiHeader, ApiTags, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

import { JwtResponseDto } from './dto/jwt-response.dto';
import { UserCredentialsDto } from './dto/user-credentials.dto';

@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @ApiResponse({ status: 200, description: 'Login was successful', type: JwtResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: UserCredentialsDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req): Promise<JwtResponseDto> {
    return req.user as JwtResponseDto;
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
