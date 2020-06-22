import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/user/user.respository';
import { User } from '@entities/user/user.entity';
import { JwtResponse } from './interfaces/jwt-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { EventLogger } from '@utilities/logging/event-logger.utility';

@Injectable()
export class AuthService {
  errorLogger: ErrorLogger = new ErrorLogger('AuthService');
  eventLogger: EventLogger = new EventLogger();
  jwtUtility: JwtUtility = new JwtUtility();

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  async findUserFromJwtPayload(payload: JwtPayload): Promise<User> {
    const { id, email } = payload;

    if (!id || !email) {
      return null;
    }

    return this.userRepository.findOne({ id: payload.id, email: email.toLowerCase() });
  }

  async logout(email: string): Promise<{message: string}> {
    const user: User = await this.userRepository.findUserByEmail(email);

    await this.userRepository.destroySession(user);

    return {message: 'Logout successful!'};
  }

  async signIn(email: string, password: string): Promise<JwtResponse> {
    const user: User = await this.userRepository.findUserByEmail(email),
      unauthorizedException: UnauthorizedException = new UnauthorizedException('Invalid credentials');

    if (!user) {
      await this.userRepository.comparePassword(password, 'q123');

      this.errorLogger.log({
        level: 'info',
        message: `SignIn - User not found for email: ${email}`
      });

      throw unauthorizedException;
    }

    const validPassword: boolean = await this.userRepository.comparePassword(password, user.password);

    if (!validPassword) {
      this.errorLogger.log({
        level: 'info',
        message: `SignIn - Password did not match for user: ${user.getFullName()}`
      });

      throw unauthorizedException;
    }

    try {
      const loggedInUser: User = await this.userRepository.createSession(user),
        sessionHash: string = loggedInUser.session_salt,
        cleanUser: Partial<User> = this.userRepository.removeSensitiveKeys(loggedInUser);

      this.jwtUtility.changeJwtOptions({
        signOptions: { expiresIn: '1h' },
        secret: sessionHash
      });

      return {
        jwt_token: await this.jwtUtility.sign({
          id: loggedInUser.id,
          email: loggedInUser.email
        }),
        user: cleanUser
      };
    } catch (error) {
      this.errorLogger.log({
        level: 'error',
        message: `SignIn - Failed to login user: ${user.getFullName()}`,
        error
      });

      throw error;
    }
  }
}
