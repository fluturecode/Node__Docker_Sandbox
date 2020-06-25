import { EntityRepository, Repository } from 'typeorm';
import { UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DatabaseErrorCodes } from '@consts/error-codes.consts';

import { EmailUtility } from '@utilities/email/email.utility';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { User } from './user.entity';
import { UserSignupDto } from '../../user/dto/user-signup.dto';

import * as bcrypt from 'bcrypt';
import environment from '@environment';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  emailUtility: EmailUtility = new EmailUtility();
  userKeysToDelete: string[] = [
    'password',
    'password_reset_hash',
    'session_salt'
  ];

  public async comparePassword(password: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(password.toString(), userPassword);
  }

  public async createSession(user: User): Promise<User> {
    user.session_salt = await this.generateSalt();

    return user.save();
  }

  public async destroySession(user: User): Promise<User> {
    user.session_salt = null;

    return await user.save();
  }

  public generateSalt(): Promise<string> {
    return bcrypt.genSalt(10);
  }

  public async findUserByEmail(email: string): Promise<User> {
    return await this.findOne({ email: email.toString().toLowerCase() });
  }

  public async hashPassword(password: string): Promise<string> {
    const salt: string = await this.generateSalt(),
      passwordHash: string = await bcrypt.hash(password.toString(), salt);

    return passwordHash;
  }

  public removeSensitiveKeys(user: User): Partial<User> {
    this.userKeysToDelete.forEach((key: string) => delete user[key]);

    return user;
  }

  public async sendResetPasswordEmail(email: string): Promise<void> {
    const user: User = await this.findUserByEmail(email),
      jwtUtility: JwtUtility = new JwtUtility();

    if (!user) {
      // TODO: Log attempt at password reset
      return;
    }

    const resetHash: string = await this.generateSalt();

    jwtUtility.changeJwtOptions({
      secret: resetHash,
      signOptions: {
        expiresIn: '1h'
      }
    });

    user.password_reset_hash = resetHash;

    await user.save();

    const resetToken: string = jwtUtility.sign({ id: user.id, email: user.email });

    await this.emailUtility.sendSingleEmail({
      subject: 'Forgotten Password',
      to: user.email,
      template: 'forgot-password',
      templateVariables: {
        applicationName: environment.application_name,
        resetUrl: `${environment.client_url}/auth/reset-password/${resetToken}`,
        user: user.getFullName()
      }
    });
  }

  public async validateTokenAndResetPassword(token: string, newPassword: string): Promise<User> {
    const jwtUtility: JwtUtility = new JwtUtility(),
      jwtPayload: JwtPayload = jwtUtility.decodeJwtToken<JwtPayload>(token),
      unauthorizedError: UnauthorizedException = new UnauthorizedException('Invalid or expired token');

    if (!jwtPayload.id || !jwtPayload.email) {
      throw unauthorizedError;
    }

    const user = await this.findOne({ id: jwtPayload.id, email: jwtPayload.email.toLowerCase() });

    if (user) {
      jwtUtility.changeJwtOptions({
        secret: user.password_reset_hash
      });

      try {
        jwtUtility.verifyToken(token);
      } catch (error) {
        throw unauthorizedError;
      }

      try {
        Object.assign(
          user,
          {
            password: await this.hashPassword(newPassword),
            password_reset_hash: null,
            session_salt: null
          }
        );

        return await user.save();
      } catch (error) {
        throw new InternalServerErrorException(error);
      }
    }

    throw unauthorizedError;
  }

  public async signUp(userData: UserSignupDto): Promise<Partial<User>> {
    try {
      const duplicateUser: User = await this.findUserByEmail(userData.email);

      if (duplicateUser) {
        throw new BadRequestException(`A user with email: ${userData.email} already exists.`);
      }

      const user: User = this.create();

      userData.email = userData.email.toLowerCase();
      userData.password = await this.hashPassword(userData.password);

      Object.assign(user, userData);

      const savedUser: User = await user.save();

      return this.removeSensitiveKeys(savedUser);
    } catch (error) {
      throw error;
    }
  }
}