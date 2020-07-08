import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@entities/user/user.entity';
import { UserRepository } from '@entities/user/user.respository';

import { UserCreationDto } from './dto/user-creation.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';

import { EmailUtility } from '@utilities/email/email.utility';
import { JwtUtility } from '@utilities/jwt/jwt.utility';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class UserService {
  emailUtility: EmailUtility = new EmailUtility();
  jwtUtility: JwtUtility = new JwtUtility();

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  public async activateUserAccount(token: string, passwordPayload: UserResetPasswordDto): Promise<User> {
    const user: User = await this.findUserFromToken(token);

    this.validateUserAndPasswordPayload(user, passwordPayload);

    await this.validateTemporaryUserToken(token, user.temporaryTokenHash);

    user.activatedAt = new Date();

    return this.userRepository.setPassword(user, passwordPayload.newPassword);
  }

  public async createUser(userData: UserCreationDto): Promise<User> {
    const newUser: User = await this.userRepository.createUser(userData);

    newUser.sendWelcomeEmail();

    return newUser;
  }

  public async getAllUsers(): Promise<Partial<User[]>> {
    const users: Partial<User[]> = await this.userRepository.findAllUsers();

    return users;
  }

  public async resetUserPassword(token: string, passwordPayload: UserResetPasswordDto): Promise<User> {
    const user: User = await this.findUserFromToken(token);

    this.validateUserAndPasswordPayload(user, passwordPayload);

    await this.validateTemporaryUserToken(token, user.temporaryTokenHash);

    return this.userRepository.setPassword(user, passwordPayload.newPassword);
  }

  public async sendResetPasswordEmail(email: string): Promise<{message: string}> {
    if (!email || !email.trim().length) {
      throw new BadRequestException('Email cannot be blank');
    }

    this.userRepository.sendResetPasswordEmail(email);

    return { message: `If ${email} is a valid email, you will receive an email with a link to reset your password.` };
  }

  public async signUp(signupDto: UserSignupDto): Promise<User> {
    const newUser: User = await this.userRepository.createUser(signupDto);

    await this.userRepository.setPassword(newUser, signupDto.password);

    return newUser;
  }

  private async findUserFromToken(token: string): Promise<User> {
    const jwtPayload: JwtPayload = await this.jwtUtility.decodeJwtToken(token);

    return await this.userRepository.findUserByJwtPayload(jwtPayload);
  }

  private async validateTemporaryUserToken(token: string, tokenSecret: string): Promise<boolean> {
    const invalidTokenException = new UnauthorizedException('Invalid or expired token');

    if (!token || !tokenSecret) {
      throw invalidTokenException;
    }

    this.jwtUtility.changeJwtOptions({ secret: tokenSecret });

    const validToken = this.jwtUtility.verifyToken<JwtPayload>(token);

    if (!validToken) {
      throw invalidTokenException;
    }

    return true;
  }

  private validateUserAndPasswordPayload(user: User, passwordPayload: UserResetPasswordDto): void {
    if (!user) {
      throw new BadRequestException('Invalid request parameters');
    }

    if (passwordPayload.newPassword !== passwordPayload.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
  }
}
