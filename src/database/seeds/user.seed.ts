import { Agency, Role, User, UserRoles } from '@models';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';

import environment from '@environment';

export class UserSeeder {
  seedEmail: string = environment.user_seed_email;
  constructor() {}

  public async seed(): Promise<void> {
    const agencyRepository: Repository<Agency> = getRepository('Agency'),
      roleRepository: Repository<Role> = getRepository('Role'),
      userRepository: Repository<User> = getRepository('User');

    const superAdminRole: Role = await roleRepository.findOne({ roleName: UserRoles.SUPER_ADMIN }),
      mainAgency = await agencyRepository.findOne({ agencyName: 'Main' });

    if (!mainAgency) {
      throw new InternalServerErrorException(`Could not find agency with name Main.`);
    }

    if (!superAdminRole) {
      throw new InternalServerErrorException(`Could not find role ${UserRoles.SUPER_ADMIN}.`);
    }

    const superAdminUser: User = await userRepository.findOne({ role: superAdminRole });

    if (!superAdminUser) {
      try {
        const duplicateUser: User = await userRepository.findOne({ email: this.seedEmail });

        if (duplicateUser) {
          return Logger.log(`Cannot seed user because a user with email: ${this.seedEmail} already exists.`, 'UserSeeder');
        }

        const newUser: User = userRepository.create({
          email: this.seedEmail,
          firstName: 'Seeded',
          lastName: 'User',
          agency: mainAgency,
          role: superAdminRole
        });

        await newUser.save();

        await newUser.sendWelcomeEmail();

        return Logger.log(`Initial user ${this.seedEmail} seeded successfully!`, 'UserSeeder');
      } catch(error) {
        throw new InternalServerErrorException(`Could not seed initial user.\n\n${error}`)
      }
    }
  }
}