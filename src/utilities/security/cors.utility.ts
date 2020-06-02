import environment from '../../environment';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

export class CorsUtility {
  allowedDevelopmentOrigins: string[] = ['http://localhost:4200'];
  allowedProductionOrigins: string[] = [];

  constructor() {}

  returnCorsConfig() {
    return {
      allowedHeaders: ['Access-Control-Allow-Credentials', 'Authorization', 'Content-Type'],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      optionsSuccessStatus: 200,
      origin: this.determineValidOrigin.bind(this),
      preflightContinue: false
    };
  }

  determineValidOrigin(origin: string, cb: Function) {
    const allowedOrigins: string[] = environment.node_env !== 'production'
      ? this.allowedDevelopmentOrigins
      : this.allowedProductionOrigins;

    // This is temporary to allow tools like postman
    if (!origin && environment.node_env === 'development') {
      return cb(null, true);
    }

    if (!allowedOrigins.includes(origin)) {
      return cb(new ForbiddenException(`Origin: ${origin} blocked.`), false);
    }

    cb(null, true);

  }
}