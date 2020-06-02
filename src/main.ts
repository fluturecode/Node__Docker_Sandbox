import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, INestApplication, InternalServerErrorException } from '@nestjs/common';

import { DatabaseUtility } from './utilities/database';
import { SwaggerUtility } from './utilities/swagger';

import environment from './environment';
import { CorsUtility } from './utilities/security/cors.utility';

import * as sentry from '@sentry/node';

class BoilerplateServer {
  app: INestApplication;
  databaseUtility: DatabaseUtility = new DatabaseUtility();
  swaggerUtility: SwaggerUtility = new SwaggerUtility();

  constructor() {}

  async bootstrap(): Promise<void> {
    this.app = await NestFactory.create(AppModule);

    sentry.init({ dsn: environment.sentry_dsn });

    await this.databaseUtility.checkForMigrations();

    this.app.enableCors(new CorsUtility().returnCorsConfig());

    this.swaggerUtility.initializeSwagger(this.app);

    await this.app.listen(environment.port);

    Logger.log(`Server up and running on port: ${environment.port}`, 'NestApplication');
  }
}

const server: BoilerplateServer = new BoilerplateServer();

server.bootstrap();