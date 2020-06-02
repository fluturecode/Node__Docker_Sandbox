import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, INestApplication } from '@nestjs/common';

import { DatabaseUtility } from './utilities/database';
import { SwaggerUtility } from './utilities/swagger';

import environment from './environment';

class BoilerplateServer {
  app: INestApplication;
  databaseUtility: DatabaseUtility = new DatabaseUtility();
  swaggerUtility: SwaggerUtility = new SwaggerUtility();

  constructor() {}

  async bootstrap(): Promise<void> {
    this.app = await NestFactory.create(AppModule);

    await this.databaseUtility.checkForMigrations();

    this.swaggerUtility.initializeSwagger(this.app);

    await this.app.listen(environment.port);

    Logger.log(`Server up and running on port: ${environment.port}`, 'NestApplication');
  }
}

const server: BoilerplateServer = new BoilerplateServer();

server.bootstrap();