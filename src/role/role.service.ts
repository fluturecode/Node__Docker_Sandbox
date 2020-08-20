import { Injectable } from '@nestjs/common';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { RoleRepository, Role } from '@entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleService {
  errorLogger: ErrorLogger = new ErrorLogger('RoleService');

  constructor(
    @InjectRepository(RoleRepository)
    private roleRespository: RoleRepository
  ) {}

  public async getUserRoles(userRole: Role): Promise<Role[]> {
    return this.roleRespository.findRolesByRoleNames(userRole.allowedUserRoles);
  }
}
