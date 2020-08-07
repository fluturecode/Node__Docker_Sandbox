import { Logger } from '@nestjs/common';
import { UserRoleSeeder } from '@seeds/user-roles.seed';

interface DatabaseSeed {
  order: number;
  classConstructor: any;
}

export class DatabaseSeeder {
  seeds: DatabaseSeed[] = [
    {
      order: 1,
      classConstructor: UserRoleSeeder
    }
  ];

  constructor() {}

  public async runAllSeeders(): Promise<void> {
    this.seeds.sort((a, b) => a.order - b.order).forEach(async seed => {
      const seeder = new seed.classConstructor();

      if (seeder.seed) {
        await seeder.seed();
      }
    });

    Logger.log('Database fully seeded!', 'DatabaseSeeder');
  }
}