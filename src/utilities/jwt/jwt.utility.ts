import { JwtService, JwtModuleOptions } from '@nestjs/jwt';

import environment from '@environment';

export class JwtUtility {
  jwtService: JwtService;
  serverSecret: string = environment.jwt_secret;

  constructor(options?: JwtModuleOptions) {
    this.jwtService = new JwtService(
      Object.assign(
        { secret: this.serverSecret },
        options
      )
    );
  }

  changeJwtOptions(options: JwtModuleOptions) {
    if (options.secret) {
      options.secret = this.returnDyanmicSigningKey(options.secret);
    }

    this.jwtService = new JwtService(options);
  }

  decodeJwtToken<T>(token: string): T {
    const jsonSplit = token.split('.')[1],
      decodedPayload = JSON.parse(Buffer.from(jsonSplit, 'base64').toString('ascii'));

    return decodedPayload;
  }

  returnDyanmicSigningKey(secret: string | Buffer): string {
    return secret += this.serverSecret;
  }

  sign(payload): string {
    return this.jwtService.sign(payload);
  }

  verifyToken<T extends object>(token: string): T {
    return this.jwtService.verify<T>(token);
  }
}