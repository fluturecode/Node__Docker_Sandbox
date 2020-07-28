import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, INestApplication } from '@nestjs/common';

import { CorsUtility } from '@utilities/security/cors.utility';
import { DatabaseUtility } from '@utilities/database';
import { EventLogger } from '@utilities/logging/event-logger.utility';
import { EventLoggerInterceptor } from './interceptors/event-logger.interceptor';
import { SwaggerUtility } from '@utilities/swagger';

import environment from '@environment';

import * as sentry from '@sentry/node';

class BoilerplateServer {
  app: INestApplication;
  databaseUtility: DatabaseUtility = new DatabaseUtility();
  eventLogger: EventLogger = new EventLogger();
  swaggerUtility: SwaggerUtility = new SwaggerUtility();

  constructor() {}

  async bootstrap(): Promise<void> {
    this.app = await NestFactory.create(AppModule);

    sentry.init({ dsn: environment.sentry_dsn });

    await this.databaseUtility.checkForMigrations();

    await this.databaseUtility.seedDatabase();

    this.app.enableCors(new CorsUtility().returnCorsConfig());

    this.swaggerUtility.initializeSwagger(this.app);

    this.app.useGlobalInterceptors(new EventLoggerInterceptor());

    await this.app.listen(environment.port);

    Logger.log(`Server up and running on port: ${environment.port}`, 'NestApplication');
  }
}

const server: BoilerplateServer = new BoilerplateServer();

server.bootstrap();