import { EntityRepository, Repository, In } from 'typeorm';
import { Role, UserRoles } from '@entities';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
  public findRoleById(id: number): Promise<Role> {
    return this.findOne({ id });
  }

  public findRoleByName(roleName: UserRoles): Promise<Role> {
    return this.findOne({ roleName });
  }

  public findRolesByRoleNames(roleNames: UserRoles[]): Promise<Role[]> {
    return this.find({ roleName: In(roleNames) });
  }
}