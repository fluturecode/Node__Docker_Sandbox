import { createConnection, Connection, getConnection } from 'typeorm';
import { TypeOrmConfig } from './typeorm.config';
import { Logger } from '@nestjs/common';
import { DatabaseSeeder } from '@seeds/index';

export class DatabaseUtility {
  databaseConnection: Connection;
  databaseSeeder: DatabaseSeeder = new DatabaseSeeder();

  constructor() {}

  async connect(): Promise<void> {
    this.databaseConnection = await createConnection(TypeOrmConfig);

    this.checkForMigrations();
  }

  async checkForMigrations(connection?: Connection): Promise<void> {
    this.databaseConnection = connection || await getConnection();

    const pendingMigrations: boolean = await this.databaseConnection.showMigrations();

    if (pendingMigrations) {
      Logger.log('Running pending migrations...', 'DatabaseUtility');

      await this.databaseConnection.runMigrations();

      Logger.log('Migrations complete!', 'DatabaseUtility');
    } else {
      Logger.log('Database up to date, no migrations required.', 'DatabaseUtility');
    }
  }

  async seedDatabase(): Promise<void> {
    await this.databaseSeeder.runAllSeeders();
  }
}