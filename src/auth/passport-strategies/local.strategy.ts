import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { JwtService } from '@nestjs/jwt';

interface JwtResponse {
  jwt_token: string;
  user: Partial<User>;
}

interface User {
  id: number;
  email: string;
  password: string;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // This is very temporary until the auth service and user entity are finished
  users: User[] = [
    {
      id: 1,
      email: 'mwallert@shift3tech.com',
      password: 'goodpassword1'
    }
  ];

  constructor(
    private jwtService: JwtService
  ) {
    super({
      usernameField: 'email'
    });
  }

  async validate(email: string, password: string): Promise<JwtResponse> {
    // TODO: Implement Auth/User service validate user
    const user: User = this.users.find((u: User) => u.email === email && u.password === password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    delete user.password;

    return {
      jwt_token: this.jwtService.sign(user),
      user
    };
  }
}