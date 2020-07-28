import { LocalStrategy } from './local.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth.service';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

import { User, UserRepository } from '@entities';

interface UserCredentials {
  email: string;
  password: string;
}

const testUserPayload = {
    id: 1,
    email: 'mwallert@shift3tech.com',
    sessionSalt: '2537*&endu))198'
  },
  testUsers: Partial<User>[] = [
    {
      id: 1,
      firstName: 'Michael',
      lastName: 'Wallert',
      email: 'mwallert@shift3tech.com',
      password: 'goodpassword1',
      sessionSalt: '2537*&endu))198',
      temporaryTokenHash: 'c6DMv%71mVg0c3',
      activatedAt: new Date(),
      getFullName: () => {
        return `${this.firstName} ${this.lastName}`;
      },
      save: () => {
        return new Promise((resolve) => {
          resolve(
            Object.assign(new User(), testUserPayload)
          );
        });
      }
    }
  ];

const mockUserRespository = () => ({
  comparePassword: (password: string) => testUsers.find((u: User) => u.password === password),
  createSession: (user: User) => Object.assign({}, testUserPayload),
  findActivatedUserByEmail: (email: string) => testUsers.find((u: User) => u.email === email && u.activatedAt),
  generateSalt: () => '2537*&endu))198'
});

describe('LocalStrategy', () => {
  const invalidUserCredentials: UserCredentials = {
      email: 'mwallert@shift3tech.com',
      password: 'abc123'
    },
    validUserCredentials: UserCredentials = {
      email: 'mwallert@shift3tech.com',
      password: 'goodpassword1'
    },
    unauthorizedException: UnauthorizedException = new UnauthorizedException('Invalid credentials');

  let localStrategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        LocalStrategy,
        JwtUtility,
        {
          provide: UserRepository,
          useFactory: mockUserRespository
        }
      ]
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
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
      const jwtResponse = await localStrategy.validate(
        validUserCredentials.email,
        validUserCredentials.password
      );

      expect(jwtResponse).toBeTruthy();
    });
  });
});