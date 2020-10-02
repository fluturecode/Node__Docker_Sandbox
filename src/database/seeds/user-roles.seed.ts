import { UserRoles, Role } from '@models';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';

import * as _ from 'lodash';

export class UserRoleSeeder {
  constructor() {}

  public async seed(): Promise<void> {
    const roleRepository: Repository<Role> = getRepository('Role'),
      newRoles: Partial<Role>[] = [];

    await Promise.all(Object.values(UserRoles).map((async (roleName: UserRoles) => {
      const existingRole: Role = await roleRepository.findOne({ roleName });

      if (!existingRole) {
        newRoles.push({ roleName });
      }
    })));

    if (newRoles.length) {
      Logger.log(`Seeding user roles...`, 'UserRoleSeeder');

      try {
        await roleRepository.save(newRoles);

        Logger.log('User roles seeded successfully!', 'UserRoleSeeder');
      } catch (error) {
        throw new InternalServerErrorException(`Unable to seed user roles - \n\n${error}`);
      }
    }
  }
}