import { createConnection, Connection, getConnection } from 'typeorm';
import { TypeOrmConfig } from './typeorm.config';
import { UnitTestingTypeOrmConfig } from './unit-testing.config';
import { Logger } from '@nestjs/common';
import { DatabaseSeeder } from '@seeds/index';
import { DatabaseErrorCodes } from '@consts/error-codes.consts';

export class DatabaseUtility {
  databaseConnection: Connection;
  databaseSeeder: DatabaseSeeder = new DatabaseSeeder();

  constructor() {}

  async connect(): Promise<void> {
    this.databaseConnection = await createConnection(TypeOrmConfig);

    this.checkForMigrations();
  }

  async checkForMigrations(): Promise<void> {
    this.databaseConnection = await getConnection();

    this.runMigrations(this.databaseConnection);

    await this.migrateTestDatabase();
  }

  async migrateTestDatabase() {
    try {
      await this.databaseConnection.query(`CREATE DATABASE ${UnitTestingTypeOrmConfig.database}`);
    } catch (error) {
      if (error.code !== DatabaseErrorCodes.DatabaseAlreadyExists) {
        throw error;
      }
    }

    const testDbConnection = await createConnection(UnitTestingTypeOrmConfig);

    await this.runMigrations(testDbConnection);
  }

  async runMigrations(connection: Connection) {
    const pendingMigrations: boolean = await connection.showMigrations();

    if (pendingMigrations) {
      Logger.log(`Running pending migrations for connection ${connection.name}...`, 'DatabaseUtility');

      await connection.runMigrations();

      Logger.log('Migrations complete!', 'DatabaseUtility');
    } else {
      Logger.log('Database up to date, no migrations required.', 'DatabaseUtility');
    }
  }

  async seedDatabase(): Promise<void> {
    await this.databaseSeeder.runAllSeeders();
  }
}