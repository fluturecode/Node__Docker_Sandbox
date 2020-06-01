import { Controller, UseGuards, Post, Request, Get, Body, ValidationPipe } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserSignupDto } from './dto/user-signup.dto';
import { User } from 'src/entities/user/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @Post('signup')
  async signup(
    @Body(ValidationPipe) userSignupPayload: UserSignupDto
  ): Promise<User> {
    return this.authService.signUp(userSignupPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req): Promise<string> {
    return this.authService.logout(req.user.email);
  }
}
