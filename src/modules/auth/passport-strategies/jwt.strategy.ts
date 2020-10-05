import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtSecretRequestType } from '@nestjs/jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { AuthService } from '../auth.service';
import { JwtUtility } from '@utilities/jwt/jwt.utility';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '@models';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private jwtUtility: JwtUtility = new JwtUtility();

  constructor(
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKeyProvider: async (
        requestType: JwtSecretRequestType,
        token: string,
        done: Function
      ): Promise<string> => {
        const tokenValues: JwtPayload = this.jwtUtility.decodeJwtToken<JwtPayload>(token),
          user: User = await authService.findUserFromJwtPayload(tokenValues);

        if (!user) {
          return done(new UnauthorizedException('Invalid auth token'), null);
        }

        return done(null, this.jwtUtility.returnDyanmicSigningKey(user.sessionSalt));
      }
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const user: User = await this.authService.findUserFromJwtPayload(payload);

    if (!user || !user.activatedAt) {
      throw new UnauthorizedException('Invalid or expired auth token');
    }

    return user;
  }
}