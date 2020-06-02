import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/user/user.respository';
import { User } from 'src/entities/user/user.entity';
import { UserSignupDto } from './dto/user-signup.dto';
import { JwtResponse } from './interfaces/jwt-response.interface';

@Injectable()
export class AuthService {
  userKeysToDelete: string[] = [
    'password',
    'session_salt'
  ];

  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  async logout(email: string): Promise<string> {
    const user: User = await this.userRepository.findUserByEmail(email);

    user.session_salt = null;

    await user.save();

    return 'Logout successful!';
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

    user.session_salt = await this.userRepository.generateSalt();

    const loggedInUser: User = await user.save();

    this.userKeysToDelete.forEach((key: string) => delete loggedInUser[key]);

    return {
      jwt_token: await this.jwtService.sign({id: loggedInUser.id, email: loggedInUser.email}),
      user
    };
  }

  // TODO: Move to User Service
  signUp(signupDto: UserSignupDto): Promise<User> {
    return this.userRepository.signUp(signupDto);
  }
}
