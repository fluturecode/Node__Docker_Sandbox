import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

import * as request from 'supertest';

import environment from '../src/environment';

describe('AppController (e2e)', () => {
  const e2eTestEnvironment = {
    jwt_secret: "e2etest"
  };

  let app: INestApplication;

  beforeAll(() => {
    Object.assign(environment, e2eTestEnvironment);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World nest installed!');
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
});
