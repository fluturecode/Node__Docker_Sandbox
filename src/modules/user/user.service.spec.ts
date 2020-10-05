import { Test, TestingModule } from '@nestjs/testing';
import { getConnection } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';

import { JwtUtility } from '@utilities/jwt/jwt.utility';
import { mockUserRepository } from '@utilities/mocked-classes';
import { UnitTestingTypeOrmConfig } from '@database/unit-testing.config';

import { UserChangePasswordDto, UserCreationDto, UserResetPasswordDto } from './dto';
import { Agency, AgencyRepository, Role, RoleRepository, User, UserRepository, UserRoles } from '@models';


describe('UserService', () => {
  let agencyRepository;
  let roleRepository;
  let testUserToken: string;
  let userService: UserService;
  let userRepository;

  const jwtUtility: JwtUtility = new JwtUtility();
  const testTemporaryTokenHash: string = 'qwijd1728jacaiwj:';
  const testUserPasswordHash: string = '%48ZrB7@yfXgIy';

  const nonExistingRole: Role = Object.assign(new Role(), { id: NaN });
  const AdminRole: Role = Object.assign(new Role(), { roleName: UserRoles.ADMIN });
  const SuperAdminRole: Role = Object.assign(new Role(), { roleName: UserRoles.SUPER_ADMIN });
  const UserRole: Role = Object.assign(new Role(), { roleName: UserRoles.ADMIN });

  const duplicateEmailCreationDto: UserCreationDto = {
    email: 'test@test-user.com',
    firstName: 'Test',
    lastName: 'User',
    profilePicture: 'No Picture',
    role: UserRole,
    agency: null
  };

  const badAgencyCreationDto: UserCreationDto = {
    email: 'test@test-user.com',
    firstName: 'Test',
    lastName: 'User',
    profilePicture: 'No Picture',
    role: nonExistingRole,
    agency: { agencyName: 'Blah' } as Agency
  };

  const badRoleCreateUserDto: UserCreationDto = {
    email: 'test@test-user.com',
    firstName: 'Test',
    lastName: 'User',
    profilePicture: 'No Picture',
    role: nonExistingRole,
    agency: null
  };

  const superAdminCreateUserDto: UserCreationDto = {
    email: 'test+super@test-user.com',
    firstName: 'Test',
    lastName: 'Super Admin',
    profilePicture: 'No Picture',
    role: SuperAdminRole,
    agency: null
  };

  const adminCreateUserDto: UserCreationDto = {
    email: 'test+admin@test-user.com',
    firstName: 'Test',
    lastName: 'Admin',
    profilePicture: 'No Picture',
    role: AdminRole,
    agency: {
      id: 1,
      agencyName: 'Main'
    } as Agency
  };

  const matchingPasswordResetDto: UserResetPasswordDto = {
    confirmPassword: 'goodPassword1$',
    newPassword: 'goodPassword1$',
  };
  const nonMatchingPasswordResetDto: UserResetPasswordDto = {
    confirmPassword: 'goodPassword1',
    newPassword: 'goodPassword1$',
  };

  const wrongPasswordChangePasswordDto: UserChangePasswordDto = {
    confirmPassword: 'Test*yq1',
    newPassword: 'Test*yq1',
    oldPassword: `1${testUserPasswordHash}`
  };

  const matchingChangePasswordDto: UserChangePasswordDto = {
    confirmPassword: 'Test*yq1',
    newPassword: 'Test*yq1',
    oldPassword: testUserPasswordHash
  };

  const nonMatchingChangePasswordDto: UserChangePasswordDto = {
    confirmPassword: 'Test*yq1',
    newPassword: 'Test*yq',
    oldPassword: testUserPasswordHash
  };

  const testUser = {
    id: 1,
    email: 'test@test-user.com',
    password: testUserPasswordHash,
    getFullName: () => 'Test User',
    sessionSalt: testUserPasswordHash,
    temporaryTokenHash: testUserPasswordHash,
    role: Object.assign(new Role, { roleName: UserRoles.ADMIN }),
    agency: {
      id: 1,
      agencyName: 'Main'
    }
  } as User;

  const noSecretTestUser = {
    id: 2,
    email: 'test-no-secret@test-user.com',
    agency: {
      agencyName: 'Test Agency 2'
    }
  } as User;

  const superAdminTestUser = {
    id: 3,
    email: 'test+super@test-user.com',
    password: testUserPasswordHash,
    getFullName: () => 'Test User',
    sessionSalt: testUserPasswordHash,
    temporaryTokenHash: testUserPasswordHash,
    role: Object.assign(new Role, { roleName: UserRoles.SUPER_ADMIN }),
    agency: {
      agencyName: 'Test Agency 1'
    }
  } as User;

  const mockAgencyRepository = () => ({
    findAgencyByName: jest.fn()
  }),
  mockRoleRepository = () => ({
    findRoleById: jest.fn()
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(UnitTestingTypeOrmConfig)
      ],
      providers: [
        UserService,
        {
          provide: AgencyRepository,
          useFactory: mockAgencyRepository
        },
        {
          provide: RoleRepository,
          useFactory: mockRoleRepository
        },
        {
          provide: UserRepository,
          useFactory: mockUserRepository
        }
      ],
    }).compile();

    agencyRepository = module.get(AgencyRepository);
    roleRepository = module.get(RoleRepository);
    userService = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);

    await setupTestData();
  });

  beforeEach(async () => {
    jwtUtility.changeJwtOptions({
      signOptions: { expiresIn: '1h' },
      secret: testTemporaryTokenHash
    });

    testUser.temporaryTokenHash = testTemporaryTokenHash;

    testUserToken = jwtUtility.sign(testUser);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('ActivateUserAccount', () => {
    it('Should throw a 400 if the activation token is missing', () => {
      return expect(() => userService.activateUserAccount(null, matchingPasswordResetDto))
        .rejects
        .toMatchObject({status: 400});
    });

    it('Should throw a 400 if the activation token does not contain a user ID', () => {
      const missingIdToken: string = jwtUtility.sign({email: 'blah'});

      return expect(() => userService.activateUserAccount(missingIdToken, matchingPasswordResetDto))
        .rejects
        .toMatchObject({status: 400});
    });

    it('Should throw a 400 if the activation token does not contain an email', () => {
      const missingEmailToken: string = jwtUtility.sign({id: 1});

      return expect(() => userService.activateUserAccount(missingEmailToken, matchingPasswordResetDto))
        .rejects
        .toMatchObject({status: 400});
    });

    it('Should throw a 400 if a user cannot be found from the token provided', () => {
      const badIDToken: string = jwtUtility.sign({id: 3, email: testUser.email});

      return expect(() => userService.activateUserAccount(badIDToken, matchingPasswordResetDto))
        .rejects
        .toMatchObject({status: 400});
    });

    it('Should throw a 400 if the new password is missing', () => {
      return expect(() => userService.activateUserAccount(testUserToken, {confirmPassword: 'test'} as UserResetPasswordDto))
        .rejects
        .toMatchObject({status: 400});
    });

    it('Should throw a 400 if the new confirmPassword is missing', () => {
      return expect(() => userService.activateUserAccount(testUserToken, {newPassword: 'test'} as UserResetPasswordDto))
        .rejects
        .toMatchObject({status: 400});
    });

    it('Should throw a 400 if the passwords do not match', () => {
      return expect(() => userService.activateUserAccount(testUserToken, nonMatchingPasswordResetDto))
        .rejects
        .toMatchObject({status: 400});
    });

    it('Should throw a 401 the user does not have a temporaryTokenSecret', () => {
      const noSecretToken: string = jwtUtility.sign(noSecretTestUser);

      userRepository.findUserByJwtPayload.mockReturnValue(noSecretTestUser);

      return expect(() => userService.activateUserAccount(noSecretToken, matchingPasswordResetDto))
        .rejects
        .toMatchObject({status: 401});
    });

    it('Should throw a 401 if the token was not signed with the proper user secret', () => {
      jwtUtility.changeJwtOptions({
        signOptions: { expiresIn: '1h' },
        secret: 'blah'
      });

      const badSignedTestToken: string = jwtUtility.sign(testUser);

      userRepository.findUserByJwtPayload.mockReturnValue(testUser);

      return expect(() => userService.activateUserAccount(badSignedTestToken, matchingPasswordResetDto))
        .rejects
        .toMatchObject({status: 401});
    });

    it('Should throw a 401 if the same token is used twice', () => {
      return expect(async () => {
        userRepository.findUserByJwtPayload.mockReturnValue(testUser);

        await userService.activateUserAccount(testUserToken, matchingPasswordResetDto);

        testUser.temporaryTokenHash = 'blah';

        return userService.activateUserAccount(testUserToken, matchingPasswordResetDto);
      })
      .rejects
      .toMatchObject({status: 401});
    });

    it('Should return an activated User', async () => {
      userRepository.findUserByJwtPayload.mockReturnValue(testUser);
      userRepository.setPassword.mockReturnValue(testUser);

      const activatedUser = await userService.activateUserAccount(testUserToken, matchingPasswordResetDto);

      expect(activatedUser).toBeTruthy();
    });
  });

  describe('ChangeUserPassword', () => {
    it(`Should return a 403 when attempting to change another users password`, () => {
      return expect(() => {
        return userService.changeUserPassword(
          noSecretTestUser.id,
          matchingChangePasswordDto,
          testUser as User
        );
      })
      .rejects
      .toMatchObject({status: 403});
    });

    it(`Should return a 400 when the passwords do not match`, () => {
      return expect(() => {
        return userService.changeUserPassword(
          testUser.id,
          nonMatchingChangePasswordDto,
          testUser as User
        );
      })
      .rejects
      .toMatchObject({status: 400});
    });

    it(`Should return a 404 when passed a userId that does not exist`, () => {
      return expect(() => {
        userRepository.findUserById.mockReturnValue(false);

        return userService.changeUserPassword(
          3,
          matchingChangePasswordDto,
          { id: 3 } as User
        );
      })
      .rejects
      .toMatchObject({status: 404});
    });

    it(`Should return a 400 if the password passed does not match the user's password`, () => {
      return expect(() => {
        userRepository.findUserById.mockReturnValue(testUser);
        userRepository.comparePassword.mockReturnValue(false);

        return userService.changeUserPassword(
          testUser.id,
          wrongPasswordChangePasswordDto,
          testUser as User
        );
      })
      .rejects
      .toMatchObject({status: 400});
    });

    it(`Should change the user's sessionSalt to a new hash`, async () => {
      userRepository.findUserById.mockReturnValue(testUser);
      userRepository.comparePassword.mockReturnValue(true);
      userRepository.setPassword.mockImplementationOnce(() => testUser);
      userRepository.createSession.mockImplementationOnce(() => {
        testUser.sessionSalt = testTemporaryTokenHash;

        return testUser;
      });

      const userSession = await userService.changeUserPassword(
        testUser.id,
        matchingChangePasswordDto,
        testUser as User
      );

      expect(userSession.user).toMatchObject({sessionSalt: testTemporaryTokenHash});
    });

    it(`Should change the user's password to the one passed in`, async () => {
      userRepository.findUserById.mockReturnValue(testUser);
      userRepository.comparePassword.mockReturnValue(true);
      userRepository.setPassword.mockImplementationOnce(() => {
        testUser.password = matchingChangePasswordDto.newPassword;

        return testUser;
      });
      userRepository.createSession.mockImplementationOnce(() => {
        testUser.sessionSalt = testTemporaryTokenHash;

        return testUser;
      });

      const newSession = await userService.changeUserPassword(
        testUser.id,
        matchingChangePasswordDto,
        testUser as User
      );

      expect(newSession.user).toMatchObject({password: matchingChangePasswordDto.newPassword});
    });

    it(`Should return a new user session`, async () => {
      userRepository.findUserById.mockReturnValue(testUser);
      userRepository.comparePassword.mockReturnValue(true);
      userRepository.setPassword.mockImplementationOnce(() => {
        testUser.password = matchingChangePasswordDto.newPassword;

        return testUser;
      });
      userRepository.createSession.mockImplementationOnce(() => {
        testUser.sessionSalt = testTemporaryTokenHash;

        return testUser;
      });

      const newSession = await userService.changeUserPassword(
        testUser.id,
        matchingChangePasswordDto,
        testUser as User
      );

      expect(newSession).toBeTruthy();
    });
  });

  describe('CreateUser', () => {
    it(`Should return a 400 if the user role passed in does not exist`, () => {
      roleRepository.findRoleById.mockReturnValue(false);

      return expect(() => userService.createUser(badRoleCreateUserDto, testUser))
        .rejects
        .toMatchObject({ status: 400 });
    });

    it(`Should return a 403 if the user role passed in cannot be accessed by the requesting user`, () => {
      roleRepository.findRoleById.mockReturnValue(SuperAdminRole);

      return expect(() => userService.createUser(superAdminCreateUserDto, testUser))
        .rejects
        .toMatchObject({ status: 403 });
    });

    it(`Should return a 400 if the agency in the user object does not exist`, () => {
      roleRepository.findRoleById.mockReturnValue(UserRole);
      agencyRepository.findAgencyByName.mockReturnValue(false);

      return expect(() => userService.createUser(badAgencyCreationDto, superAdminTestUser))
        .rejects
        .toMatchObject({ status: 400 });
    });

    it(`Should return a 400 if the new user's email address matches an existing user`, () => {
      roleRepository.findRoleById.mockReturnValue(UserRole);
      userRepository.createUser.mockImplementationOnce(() => {
        throw new BadRequestException();
      });

      return expect(() => userService.createUser(duplicateEmailCreationDto, testUser))
        .rejects
        .toMatchObject({ status: 400 });
    });

    it(`Should allow the user's agency to be set if the requesting user is a Super Admin`, async () => {
      roleRepository.findRoleById.mockReturnValue(AdminRole);
      agencyRepository.findAgencyByName.mockReturnValue({id: 1, agencyName: 'Main'});
      userRepository.createUser.mockImplementationOnce(() => {
        return Object.assign(new User(), { agency: adminCreateUserDto.agency });
      });

      const newUser: User = await userService.createUser(adminCreateUserDto, superAdminTestUser);

      expect(newUser).toMatchObject({ agency: adminCreateUserDto.agency });
    });

    it(`Should return a new user`, async () => {
      const adminRoleMock: Role = await getConnection('unit_tests').manager.findOne(Role, { roleName: UserRoles.ADMIN });

      roleRepository.findRoleById.mockReturnValue(AdminRole);
      agencyRepository.findAgencyByName.mockReturnValue({id: 1, agencyName: 'Main'});
      userRepository.createUser.mockImplementationOnce(() => {
        return Object.assign(new User(), adminCreateUserDto, { role: adminRoleMock });
      });

      const newUser: User = await userService.createUser(adminCreateUserDto, testUser);
      const expectedUserValue = Object.assign(adminCreateUserDto, { activatedAt: null, agency: testUser.agency });
      const savedUser = await getConnection('unit_tests').manager.save(newUser);

      expect(savedUser).toMatchObject(expectedUserValue);
    });
  });

  afterAll(async () => {
    await clearTestData();

    await getConnection('unit_tests').close();
  });
});

const clearTestData = async () => {
  await getConnection('unit_tests').manager.delete(User, { firstName: 'Test' });
};

const setupTestData = async () => {
  const adminRole: Role = await getConnection('unit_tests').manager.findOne(Role, { roleName: UserRoles.ADMIN });

  if (!adminRole) {
    await getConnection('unit_tests').manager.save(Role, { roleName: UserRoles.ADMIN });
  }
};