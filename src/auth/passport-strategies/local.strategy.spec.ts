import { LocalStrategy } from './local.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../entities/user/user.respository';
import { User } from '../../entities/user/user.entity';

interface UserCredentials {
  email: string;
  password: string;
}

const testUserPayload = { id: 1, email: 'mwallert@shift3tech.com', session_salt: '2537*&endu))198' };

const testUsers: Partial<User>[] = [
  {
    email: 'mwallert@shift3tech.com',
    password: 'goodpassword1',
    session_salt: '2537*&endu))198',
    save: () => {
      return new Promise((resolve) => {
        resolve(
          Object.assign(new User(), testUserPayload)
        );
      });
    }
  }
];

const mockJwtService = () => ({
    sign: (payload) => payload
  }),
  mockUserRespository = () => ({
    comparePassword: (password: string) => testUsers.find((u: User) => u.password === password),
    createSession: (user: User) => Object.assign({}, testUserPayload),
    findUserByEmail: (email: string) => testUsers.find((u: User) => u.email === email),
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
        {
          provide: JwtService,
          useFactory: mockJwtService
        },
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
      const jwtResponse = await localStrategy.validate(validUserCredentials.email, validUserCredentials.password);

      expect(jwtResponse).toEqual({
        jwt_token: testUserPayload,
        user: testUsers[0]
      });
    });
  });
});