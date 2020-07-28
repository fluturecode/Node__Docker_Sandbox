import { UserRoles, Role } from '@entities';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';

import * as _ from 'lodash';

export class UserRoleSeeder {
  constructor() {}

  roleSeed: Partial<Role>[] = _.reduce(UserRoles, (result: Partial<Role>[], value) => {
    result.push({roleName: value});

    return result;
  }, []);

  public async seed(): Promise<void> {
    const roleRepository: Repository<Role> = getRepository('Role'),
      existingRoles: Role[] = await roleRepository.find();

    if (!existingRoles?.length) {
      Logger.log(`Seeding user roles...`, 'UserRoleSeeder');

      try {
        await roleRepository.save(this.roleSeed);
      } catch (error) {
        throw new InternalServerErrorException(`Unable to seed user roles - \n\n${error}`);
      }
    }

    Logger.log('User roles seeded successfully!', 'UserRoleSeeder');
  }
}