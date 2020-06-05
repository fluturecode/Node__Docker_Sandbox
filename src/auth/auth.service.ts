import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/user/user.respository';
import { User } from '@entities/user/user.entity';
import { JwtResponse } from './interfaces/jwt-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

@Injectable()
export class AuthService {
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

      throw unauthorizedException;
    }

    const validPassword: boolean = await this.userRepository.comparePassword(password, user.password);

    if (!validPassword) {
      throw unauthorizedException;
    }

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
  }
}
