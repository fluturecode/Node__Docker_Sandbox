import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmConfig } from '@database/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SentryInterceptor } from '@common/interceptors/sentry.interceptor';

import { AgencyModule } from '@modules/agency/agency.module';
import { AgentModule } from '@modules/agent/agent.module';
import { AuthModule } from '@modules/auth/auth.module';
import { RoleModule } from '@modules/role/role.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(TypeOrmConfig),
    UserModule,
    RoleModule,
    AgentModule,
    AgencyModule
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
