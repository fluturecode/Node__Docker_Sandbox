import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndToEndTestingTypeOrmConfig } from '@database/e2e-testing.config';

import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot(EndToEndTestingTypeOrmConfig)
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health-check (GET) should return a valid health check', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .expect('Server up and healthy!');
  });

  it('/auth/logout (GET) should return a 401', () => {
    return request(app.getHttpServer())
      .get('/auth/logout')
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized'
      });
  });

  afterAll(async () => {
    await getConnection('default').close();
    await getConnection('e2e_testing').close();
  });
});
