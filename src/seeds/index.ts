import { Logger } from '@nestjs/common';
import { UserRoleSeeder } from '@seeds/user-roles.seed';

export class DatabaseSeeder {
  seeds = [
    UserRoleSeeder
  ];

  constructor() {}

  public async runAllSeeders(): Promise<void> {
    this.seeds.forEach(async Seeder => {
      const seeder = new Seeder();

      if (seeder.seed) {
        await seeder.seed();
      }
    });

    Logger.log('Database fully seeded!', 'DatabaseSeeder');
  }
}