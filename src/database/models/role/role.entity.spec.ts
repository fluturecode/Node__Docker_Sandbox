import { Role, RoleHierarchy, UserRoles } from '../index';

describe('RoleEntity', () => {
  let testRole: Role;

  beforeEach(() => {
    testRole = new Role();
  });

  describe('AllowedUserRoles', () => {
    it(`Should only contain roles at and below the current role's heirarchy`, () => {
      testRole.roleName = UserRoles.ADMIN;
      const allowedRoles: UserRoles[] = testRole.allowedUserRoles.sort((a, b) => RoleHierarchy[b] - RoleHierarchy[a]);

      expect(RoleHierarchy[allowedRoles[0]] > RoleHierarchy[UserRoles.ADMIN]).toBeFalsy();
    });
  });

  describe('CanAccessRole', () => {
    it(`Should return false if no role name is passed`, () => {
      expect(testRole.canAccessRole(null)).toBeFalsy();
    });

    it(`Should return false if the role name passed is not in the enum of UserRoles`, () => {
      expect(testRole.canAccessRole('Suuuuper Admin' as UserRoles)).toBeFalsy();
    });

    it(`Should return false if the role name passed has superior heirarchy`, () => {
      testRole.roleName = UserRoles.ADMIN;

      expect(testRole.canAccessRole(UserRoles.SUPER_ADMIN)).toBeFalsy();
    });

    it(`Should return true if the role name passed is the same`, () => {
      testRole.roleName = UserRoles.SUPER_ADMIN;

      expect(testRole.canAccessRole(UserRoles.SUPER_ADMIN)).toBeTruthy();
    });

    it(`Should return true if the role name passed is of lesser heirarchy`, () => {
      testRole.roleName = UserRoles.ADMIN;

      expect(testRole.canAccessRole(UserRoles.USER)).toBeTruthy();
    });
  });
});