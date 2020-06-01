import { createConnection, Connection, getConnection } from 'typeorm';
import { typeOrmConfig } from './typeorm.config';

import { Logger } from '@nestjs/common';
import environment from 'src/environment';

export class DatabaseUtility {
  databaseConnection: Connection;

  constructor() {}

  async connect(): Promise<void> {
    this.databaseConnection = await createConnection(typeOrmConfig);

    this.checkForMigrations();
  }

  async checkForMigrations(): Promise<void> {
    if (environment.node_env === 'test') {
      return;
    }

    this.databaseConnection = await getConnection();

    const pendingMigrations: boolean = await this.databaseConnection.showMigrations();

    if (pendingMigrations) {
      Logger.log('Running pending migrations...', 'DatabaseUtility');

      await this.databaseConnection.runMigrations();

      Logger.log('Migrations complete!', 'DatabaseUtility');
    } else {
      Logger.log('Database up to date, no migrations required.', 'DatabaseUtility')
    }
  }
}