import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRepository } from '@models';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { EventLogger } from '@utilities/logging/event-logger.utility';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

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

    return this.userRepository.findUserByJwtPayload(payload);
  }

  async logout(email: string): Promise<{message: string}> {
    const user: User = await this.userRepository.findActivatedUserByEmail(email);

    await this.userRepository.destroySession(user);

    return {message: 'Logout successful!'};
  }

  async signIn(email: string, password: string): Promise<JwtResponseDto> {
    const user: User = await this.userRepository.findActivatedUserByEmail(email),
      unauthorizedException: UnauthorizedException = new UnauthorizedException('Invalid credentials');

    if (!user) {
      await this.userRepository.comparePassword(password, 'q123');

      this.errorLogger.log({
        level: 'info',
        message: `SignIn - Activated user not found for email: ${email}`
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
        sessionHash: string = loggedInUser.sessionSalt;

      this.jwtUtility.changeJwtOptions({
        signOptions: { expiresIn: '1h' },
        secret: sessionHash
      });

      return new JwtResponseDto({
        jwtToken: await this.jwtUtility.sign({
          id: loggedInUser.id,
          email: loggedInUser.email
        }),
        user: loggedInUser
      });
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
