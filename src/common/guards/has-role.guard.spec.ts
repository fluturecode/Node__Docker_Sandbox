import { HasRoleGuard } from './has-role.guard';
import { User, UserRoles, Role } from '../../entities';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('HasRoleGuard', () => {
  const testSuperAdminUser = {
    id: 1,
    getFullName: () => 'Test Super Admin',
    hasRoleInRoleList: (roles: UserRoles[]) => {
      return roles.includes(UserRoles.SUPER_ADMIN)
    },
    role: {
      roleName: UserRoles.SUPER_ADMIN
    } as Role
  } as unknown as User;

  const noRoleUser = {
    id: 2,
    getFullName: () => 'Test No Role',
    hasRoleInRoleList: () => false
  } as unknown as User;

  const testUser = {
    id: 3,
    getFullName: () => 'Test User',
    hasRoleInRoleList: (roles: UserRoles[]) => {
      return roles.includes(UserRoles.USER)
    },
    role: {
      roleName: UserRoles.USER
    } as Role
  } as unknown as User;

  let hasRoleGuard: HasRoleGuard;

  const mockContext = (roles: string[], user: Partial<User>) => {
    return {
      getHandler: (): string[] => roles,
      switchToHttp: (): any => {
        return {
          getRequest: (): any => {
            return {
              method: 'GET',
              path: 'TestHasRole',
              user
            };
          }
        };
      }
    };
  };

  const mockReflector = (testContext) => {
    return {
      get: (key, context): string[] => {
        return testContext.getHandler();
      }
    } as unknown as Reflector;
  };

  beforeEach(() => {
    hasRoleGuard = null;
  });

  describe('canActivate', () => {
    it('Should return true if no roles are required', () => {
      const testContext = mockContext(null, testUser);

      hasRoleGuard = new HasRoleGuard(mockReflector(testContext));

      expect(hasRoleGuard.canActivate(testContext as unknown as ExecutionContext)).toBeTruthy();
    });

    it(`Should throw if the requesting user's role is not found in the required roles array`, () => {
      const testContext = mockContext([UserRoles.SUPER_ADMIN], testUser);

      hasRoleGuard = new HasRoleGuard(mockReflector(testContext));

      expect(() => {
        hasRoleGuard.canActivate(testContext as unknown as ExecutionContext);
      }).toThrow();
    });

    it(`Should throw if there is no user on the request object`, () => {
      const testContext = mockContext([UserRoles.SUPER_ADMIN], null);

      hasRoleGuard = new HasRoleGuard(mockReflector(testContext));

      expect(() => {
        hasRoleGuard.canActivate(testContext as unknown as ExecutionContext);
      }).toThrow();
    });

    it(`Should throw if the requesting user has no role`, () => {
      const testContext = mockContext([UserRoles.SUPER_ADMIN], noRoleUser);

      hasRoleGuard = new HasRoleGuard(mockReflector(testContext));

      expect(() => {
        hasRoleGuard.canActivate(testContext as unknown as ExecutionContext);
      }).toThrow();
    });

    it(`Should return true if the requesting user's role is found in the required roles array`, () => {
      const testContext = mockContext([UserRoles.SUPER_ADMIN], testSuperAdminUser);

      hasRoleGuard = new HasRoleGuard(mockReflector(testContext));

      expect(hasRoleGuard.canActivate(testContext as unknown as ExecutionContext)).toBeTruthy();
    });
  });
});