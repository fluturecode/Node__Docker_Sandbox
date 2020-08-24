import { Logger } from '@nestjs/common';
import { UserRoleSeeder } from '@seeds/user-roles.seed';
import { AgencySeeder } from '@seeds/agency.seed';

interface DatabaseSeed {
  order: number;
  classConstructor: any;
}

export class DatabaseSeeder {
  seeds: DatabaseSeed[] = [
    {
      order: 1,
      classConstructor: UserRoleSeeder
    },
    {
      order: 2,
      classConstructor: AgencySeeder
    }
  ];

  constructor() {}

  public async runAllSeeders(): Promise<void> {
    await this.seeds.sort((a, b) => a.order - b.order).reduce(async (promise: Promise<any>, seed: DatabaseSeed) => {
      return promise.then(() => {
        const seeder = new seed.classConstructor();

        if (seeder.seed) {
          return seeder.seed();
        }
      });
    }, Promise.resolve());

    Logger.log('Database fully seeded!', 'DatabaseSeeder');
  }
}