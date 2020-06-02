import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './utilities/database/typeorm.config';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './interceptors/sentry.interceptor';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(typeOrmConfig)
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new SentryInterceptor()
    }
  ],
})
export class AppModule {}
