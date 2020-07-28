import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User, UserRepository, RoleRepository, Role, UserRoles } from '@entities';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserCreationDto } from './dto/user-creation.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';

import { EmailUtility } from '@utilities/email/email.utility';
import { JwtUtility } from '@utilities/jwt/jwt.utility';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';

import * as _ from 'lodash';

@Injectable()
export class UserService {
  emailUtility: EmailUtility = new EmailUtility();
  errorLogger: ErrorLogger = new ErrorLogger('UserService');
  jwtUtility: JwtUtility = new JwtUtility();

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository
  ) {}

  public async activateUserAccount(token: string, passwordPayload: UserResetPasswordDto): Promise<User> {
    const user: User = await this.findUserFromToken(token);

    this.validateUserAndPasswordPayload(user, passwordPayload);

    await this.validateTemporaryUserToken(token, user.temporaryTokenHash);

    user.activatedAt = new Date();

    return this.userRepository.setPassword(user, passwordPayload.newPassword);
  }

  public async createUser(createDto: UserCreationDto, currentUser: User): Promise<User> {
    const userRole: Role = await this.roleRepository.findRoleById(createDto.roleId);

    if (!userRole) {
      this.errorLogger.log({
        level: 'info',
        message: `Unable to find User role with ID ${createDto.roleId}. Cannot create user with email: ${createDto.email}`
      });

      throw new BadRequestException(`Invalid user role: ${createDto.roleId}`);
    }

    const currentUserRole: UserRoles = _.get(currentUser, 'role.roleName'),
      canAccessRole: boolean = userRole.canAccessRole(currentUserRole, userRole.roleName);

    if (!canAccessRole) {
      this.errorLogger.log({
        level: 'info',
        message: `User with role: ${currentUserRole} attempted to create a user with role: ${userRole.roleName} but was denied access.`
      });

      throw new ForbiddenException('Access to resource denied');
    }

    return this.userRepository.createUser(createDto, userRole);
  }

  public async getAllUsers(userRole: Role): Promise<User[]> {
    return this.userRepository.findAllUsers(userRole);
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
    const userRole: Role = await this.roleRepository.findRoleByName(UserRoles.USER);

    if (!userRole) {
      this.errorLogger.log({
        level: 'info',
        message: `Unable to find User role ${UserRoles.USER}. Cannot signup user with email: ${signupDto.email}`
      });

      throw new BadRequestException('Unable to signup user.');
    }

    return this.userRepository.createUser(signupDto, userRole);
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
