import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@entities/user/user.entity';
import { UserRepository } from '@entities/user/user.respository';

import { UserSignupDto } from './dto/user-signup.dto';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRespository: UserRepository
  ) {}

  async resetUserPassword(token: string, payload: UserResetPasswordDto): Promise<{message: string}> {
    if (payload.new_password !== payload.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.userRespository.validateTokenAndResetPassword(token, payload.new_password);

    return { message: 'Password reset successfully!' };
  }

  async sendResetPasswordEmail(email: string): Promise<{message: string}> {
    if (!email || !email.trim().length) {
      throw new BadRequestException('Email cannot be blank');
    }

    this.userRespository.sendResetPasswordEmail(email);

    return { message: `If ${email} is a valid email, you will receive an email with a link to reset your password.` };
  }

  signUp(signupDto: UserSignupDto): Promise<Partial<User>> {
    return this.userRespository.signUp(signupDto);
  }
}
