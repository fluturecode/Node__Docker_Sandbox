import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface UserCredentials {
  email: string;
  password: string;
}

describe('LocalStrategy', () => {
  const invalidUserCredentials: UserCredentials = {
      email: 'mwallert@shift3tech.com',
      password: 'abc123'
    },
    validUserCredentials: UserCredentials = {
      email: 'mwallert@shift3tech.com',
      password: 'goodpassword1'
    },
    jwtService: JwtService = new JwtService({
      secret: 'test'
    }),
    unauthorizedException: UnauthorizedException = new UnauthorizedException('Invalid credentials.');

  let localStrategy: LocalStrategy;

  beforeEach(async () => {
    localStrategy = new LocalStrategy(jwtService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  describe('LocalStrategy.validate', () => {
    it('should throw an UnauthorizedException when passed null for credentials', async () => {
      try {
        await localStrategy.validate(null, null);
      } catch (error) {
        expect(error).toEqual(unauthorizedException);
      }
    });

    it('should throw an UnauthorizedException when passed invalid credentials', async () => {
      try {
        await localStrategy.validate(invalidUserCredentials.email, invalidUserCredentials.password);
      } catch (error) {
        expect(error).toEqual(unauthorizedException);
      }
    });

    it('should return the JwtResponse payload when passed valid credentials', async () => {
      const userPayload = { id: 1, email: 'mwallert@shift3tech.com' },
        newToken = jwtService.sign(userPayload),
        jwtResponse = await localStrategy.validate(validUserCredentials.email, validUserCredentials.password);

      expect(jwtResponse).toEqual({
        jwt_token: newToken,
        user: userPayload
      });
    });
  });
});