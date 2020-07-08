import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../src/utilities/database/typeorm.config';

import * as request from 'supertest';


describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot(
          Object.assign(
            {},
            typeOrmConfig,
            {
              database: 'e2e_testing',
              host: 'localhost',
              name: 'e2e_testing',
              username: 'root',
              password: 'goodpassword1$'
            }
          )
        )
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await getConnection('default').close();
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

  afterEach(async () => {
    await getConnection('e2e_testing').close();
  });
});
