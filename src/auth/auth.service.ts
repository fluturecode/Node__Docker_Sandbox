import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/user/user.respository';
import { User } from 'src/entities/user/user.entity';
import { JwtResponse } from './interfaces/jwt-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

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
      cleanUser: Partial<User> = this.userRepository.removeSensativeKeys(loggedInUser);

    return {
      jwt_token: await this.jwtService.sign({
        id: loggedInUser.id,
        email: loggedInUser.email,
        session_salt: sessionHash
      }),
      user: cleanUser
    };
  }
}
