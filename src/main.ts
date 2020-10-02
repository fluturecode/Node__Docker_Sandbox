import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, INestApplication, ValidationPipe } from '@nestjs/common';

import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { EventLoggerInterceptor } from '@common/interceptors/event-logger.interceptor';

import { CorsUtility } from '@utilities/security/cors.utility';
import { EventLogger } from '@utilities/logging/event-logger.utility';
import { SwaggerUtility } from '@utilities/swagger';

import { DatabaseModule } from '@database/index';

import appMetaData from '@metadata';
import environment from '@environment';

import * as sentry from '@sentry/node';

class BoilerplateServer {
  app: INestApplication;
  databaseModule: DatabaseModule = new DatabaseModule();
  eventLogger: EventLogger = new EventLogger();
  swaggerUtility: SwaggerUtility = new SwaggerUtility();

  constructor() {}

  async bootstrap(): Promise<void> {
    this.app = await NestFactory.create(AppModule);

    sentry.init(
      {
        environment: environment.node_env,
        dsn: environment.sentry_dsn,
        release: appMetaData.release,
        beforeSend: (event: sentry.Event) => {
          if (environment.node_env !== 'production') {
            return null;
          }

          return event;
        }
      }
    );

    await this.databaseModule.checkForMigrations();

    await this.databaseModule.seedDatabase();

    this.app.enableCors(new CorsUtility().returnCorsConfig());

    this.swaggerUtility.initializeSwagger(this.app);

    this.app.useGlobalFilters(new AllExceptionsFilter());
    this.app.useGlobalInterceptors(new EventLoggerInterceptor());
    this.app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true
    }));

    await this.app.listen(environment.port);

    Logger.log(`Server version ${appMetaData.version} up and running on port: ${environment.port}`, 'NestApplication');
  }
}

const server: BoilerplateServer = new BoilerplateServer();

server.bootstrap();