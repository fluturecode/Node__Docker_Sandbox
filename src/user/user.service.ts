import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';

import {
  UserChangePasswordDto,
  UserCreationDto,
  UserQueryParamsDto,
  UserResetPasswordDto,
  UserSignupDto,
  UserUpdateDto,
  UserUpdateProfileDto
} from './dto';

import {
  RoleRepository,
  Role,
  User,
  UserRoles,
  UserRepository,
  AgencyRepository,
  Agency
} from '@entities';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtResponseDto } from '../auth/dto/jwt-response.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { EmailUtility } from '@utilities/email/email.utility';
import { JwtUtility } from '@utilities/jwt/jwt.utility';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { DatabaseErrorCodes } from '@consts/error-codes.consts';

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
    private roleRepository: RoleRepository,
    @InjectRepository(AgencyRepository)
    private agencyRepository: AgencyRepository
  ) {}

  public async activateUserAccount(token: string, passwordPayload: UserResetPasswordDto): Promise<User> {
    const user: User = await this.findUserFromToken(token);

    if (!user) {
      throw new BadRequestException(`Could not find user from token provided`);
    }

    this.validateUserAndPasswordPayload(user, passwordPayload);

    await this.validateTemporaryUserToken(token, user.temporaryTokenHash);

    user.activatedAt = new Date();

    return await this.userRepository.setPassword(user, passwordPayload.newPassword);
  }

  public async changeUserPassword(
    userId: number,
    passwordChangePayload: UserChangePasswordDto,
    currentUser: User
  ): Promise<JwtResponseDto> {
    if (userId !== currentUser.id) {
      throw new ForbiddenException(`Cannot change another user's password`);
    }

    if (passwordChangePayload.newPassword !== passwordChangePayload.confirmPassword) {
      throw new BadRequestException(`Passwords do not match`);
    }

    const user: User = await this.userRepository.findUserById(userId, currentUser);

    if (!user) {
      await this.userRepository.comparePassword('Abc', 'def');

      throw new NotFoundException(`Cannot find user with id: ${userId}`);
    }

    const passwordMatches: boolean = await this.userRepository.comparePassword(
      passwordChangePayload.oldPassword,
      user.password
    );

    if (!passwordMatches) {
      this.errorLogger.log({
        level: 'info',
        message: `PasswordChange - Password did not match for user: ${user.getFullName()}`
      });

      throw new BadRequestException(`Invalid request payload.`);
    }

    const updatedUser: User = await this.userRepository.setPassword(user, passwordChangePayload.newPassword),
      loggedInUser: User = await this.userRepository.createSession(updatedUser);

    this.jwtUtility.changeJwtOptions({
      signOptions: { expiresIn: '1h' },
      secret: loggedInUser.sessionSalt
    });

    return new JwtResponseDto({
      jwtToken: await this.jwtUtility.sign({
        id: loggedInUser.id,
        email: loggedInUser.email
      }),
      user: loggedInUser
    });
  }

  public async createUser(createDto: UserCreationDto, currentUser: User): Promise<User> {
    const userRole: Role = await this.roleRepository.findRoleById(createDto.role.id);

    if (!userRole) {
      this.errorLogger.log({
        level: 'info',
        message: `Unable to find User role with ID ${createDto.role.id}. Cannot create user with email: ${createDto.email}`
      });

      throw new BadRequestException(`Invalid user role: ${createDto.role.id}`);
    }

    const currentUserRole: UserRoles = currentUser.role.roleName,
      canAccessRole: boolean = currentUser.role.canAccessRole(userRole.roleName);

    if (!canAccessRole) {
      this.errorLogger.log({
        level: 'info',
        message: `User with role: ${currentUserRole} attempted to create a user with role: ${userRole.roleName} but was denied access.`
      });

      throw new ForbiddenException('Access to resource denied');
    }

    let userAgency: Agency = currentUser.agency;

    if (currentUserRole === UserRoles.SUPER_ADMIN && createDto.agency) {
      userAgency = await this.agencyRepository.findAgencyByName(createDto.agency.agencyName);

      if (!userAgency) {
        throw new BadRequestException(`Unable to find agency with name ${createDto.agency.agencyName}`);
      }
    }

    return await this.userRepository.createUser(createDto, userRole, userAgency);
  }

  public async findSingleUser(userId: number, currentUser: User): Promise<User> {
    const user: User = await this.userRepository.findUserById(userId, currentUser);

    if (!user) {
      throw new NotFoundException(`Cannot find user with id: ${userId}`);
    }

    if (!currentUser.role.canAccessRole(user.role.roleName)) {
      throw new ForbiddenException(`Current user with role: ${currentUser.role.roleName} cannot access user with role: ${user.role.roleName}`);
    }

    return user;
  }

  public async getAllUsers(currentUser: User, queryParams: UserQueryParamsDto): Promise<User[]> {
    return this.userRepository.findAllUsers(currentUser, queryParams);
  }

  public async resendActivationEmail(userId: number, currentUser: User): Promise<User> {
    const user: User = await this.findSingleUser(userId, currentUser);

    if (user.activatedAt) {
      throw new BadRequestException(`User has already been activated.`);
    }

    await user.sendWelcomeEmail();

    return user;
  }

  public async resetUserPassword(token: string, passwordPayload: UserResetPasswordDto): Promise<User> {
    const user: User = await this.findUserFromToken(token);

    this.validateUserAndPasswordPayload(user, passwordPayload);

    await this.validateTemporaryUserToken(token, user.temporaryTokenHash);

    return await this.userRepository.setPassword(user, passwordPayload.newPassword);
  }

  public async sendResetPasswordEmail(email: string): Promise<{message: string}> {
    if (!email || !email.trim().length) {
      throw new BadRequestException('Email cannot be blank');
    }

    this.userRepository.sendResetPasswordEmail(email);

    return { message: `If ${email} is a valid email, you will receive an email with a link to reset your password.` };
  }

  public async signUp(signupDto: UserSignupDto): Promise<User> {
    const userAgency = await this.agencyRepository.findAgencyByName('Public'),
      userRole: Role = await this.roleRepository.findRoleByName(UserRoles.USER);

    if (!userRole) {
      this.errorLogger.log({
        level: 'info',
        message: `Unable to find User role ${UserRoles.USER}. Cannot signup user with email: ${signupDto.email}`
      });

      throw new BadRequestException('Unable to signup user.');
    }

    return await this.userRepository.createUser(signupDto, userRole, userAgency);
  }

  public async softDeleteUser(currentUser: User, userId: number): Promise<User> {
    if (currentUser.id === userId) {
      throw new ForbiddenException('Cannot delete your own user.');
    }

    const userToDelete: User = await this.findUserAndDetermineAccess(currentUser, userId);

    userToDelete.softDelete(currentUser.id);

    const deletedUser: User = await userToDelete.save();

    this.errorLogger.log({
      level: 'info',
      message: `User | ID: ${userId}, Name: ${userToDelete.getFullName()} | was soft deleted by User | ID: ${currentUser.id} Name: ${currentUser.getFullName()}`
    });

    return deletedUser;
  }

  public async updateUserProfile(currentUser: User, userId: number, userData: UserUpdateProfileDto): Promise<User> {
    const userToUpdate: User = await this.findSingleUser(userId, currentUser);

    Object.assign(userToUpdate, userData);

    try {
      const updatedUser: User = await userToUpdate.save();

      return updatedUser;
    } catch (error) {
      if (error.code === DatabaseErrorCodes.DuplicateKeyConstraint) {
        throw new BadRequestException(error.detail);
      }

      throw error;
    }
  }

  public async updateSingleUser(currentUser: User, userId: number, userData: UserUpdateDto): Promise<User> {
    const userToUpdate: User = await this.findUserAndDetermineAccess(currentUser, userId);

    if (currentUser.id === userId) {
      delete userData.role;
    }

    if (userData.role) {
      const newUserRole: Role = await this.roleRepository.findRoleById(_.get(userData, 'role.id'));

      if (!newUserRole) {
        this.errorLogger.log({
          level: 'info',
          message: `User - ID: ${currentUser.id}, Name: ${currentUser.getFullName()} attempted to update user | ID: ${userId}, Name: ${userToUpdate.getFullName()} | with an invalid role | ${JSON.stringify(_.get(userData, 'role', {}))}`
        });

        throw new BadRequestException(`Could not update user because of invalid user role with ID: ${_.get(userData, 'role.id')}`);
      }

      if (!currentUser.role.canAccessRole(newUserRole.roleName)) {
        this.errorLogger.log({
          level: 'info',
          message: `User - ID: ${currentUser.id}, Name: ${currentUser.getFullName()} attempted to update user | ID: ${userId}, Name: ${userToUpdate.getFullName()} | with a role they do not have access to | ${JSON.stringify(_.get(userData, 'role', {}))} |`
        });

        throw new ForbiddenException(`Current user with role: ${currentUser.role.roleName} cannot update a user to role: ${newUserRole.roleName}`);
      }

      userData.role = Object.assign({} , { id: newUserRole.id, roleName: newUserRole.roleName });
    }

    Object.assign(userToUpdate, userData);

    try {
      const updatedUser: User = await userToUpdate.save();

      return updatedUser;
    } catch (error) {
      if (error.code === DatabaseErrorCodes.DuplicateKeyConstraint) {
        throw new BadRequestException(error.detail);
      }

      throw error;
    }
  }

  private async findUserAndDetermineAccess (currentUser: User, userId: number): Promise<User> {
    const accessedUser: User = await this.userRepository.findUserById(userId, currentUser);

    if (!accessedUser) {
      throw new BadRequestException(`Unable to find user with ID: ${userId}`);
    }

    const currentUserRole: UserRoles = currentUser.role.roleName,
      accessedUserRole: UserRoles = accessedUser.role.roleName,
      canAccessRole: boolean = currentUser.role.canAccessRole(accessedUserRole);

    if (!canAccessRole) {
      this.errorLogger.log({
        level: 'info',
        message: `User with a role of | ${currentUserRole} | attempted to access a user with a role of | ${accessedUserRole} |`
      });

      throw new ForbiddenException(`Current user with role: ${currentUserRole} cannot delete a user with role: ${accessedUserRole}`);
    }

    return accessedUser;
  }

  private async findUserFromToken(token: string): Promise<User> {
    if (!token) {
      throw new BadRequestException(`No token was passed`);
    }

    const jwtPayload: JwtPayload = await this.jwtUtility.decodeJwtToken(token);

    if (!jwtPayload.id || !jwtPayload.email) {
      throw new BadRequestException(`Invalid token missing user ID or email`);
    }

    return await this.userRepository.findUserByJwtPayload(jwtPayload);
  }

  private async validateTemporaryUserToken(token: string, tokenSecret: string): Promise<boolean> {
    const invalidTokenException = new UnauthorizedException('Invalid or expired token');

    if (!token || !tokenSecret) {
      throw invalidTokenException;
    }

    this.jwtUtility.changeJwtOptions({ secret: tokenSecret });

    try {
      this.jwtUtility.verifyToken<JwtPayload>(token);

      return true;
    } catch (error) {
      throw invalidTokenException;
    }
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
