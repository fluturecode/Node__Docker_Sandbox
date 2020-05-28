import { createConnection, Connection } from 'typeorm';
import { typeOrmConfig } from './typeorm.config';

import { Logger } from '@nestjs/common';

export class DatabaseUtility {
  databaseConnection: Connection;

  constructor() {}

  async connect(): Promise<void> {
    this.databaseConnection = await createConnection(typeOrmConfig);

    this.checkForMigrations(this.databaseConnection);
  }

  async checkForMigrations(connection: Connection): Promise<void> {
    const pendingMigrations: boolean = await connection.showMigrations();

    if (pendingMigrations) {
      Logger.log('Running pending migrations...', 'DatabaseUtility');

      await connection.runMigrations();

      Logger.log('Migrations complete!', 'DatabaseUtility');
    } else {
      Logger.log('Database up to date, no migrations required.', 'DatabaseUtility')
    }
  }
}