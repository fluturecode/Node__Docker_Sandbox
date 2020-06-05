import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtSecretRequestType } from '@nestjs/jwt';

import { AuthService } from '../auth.service';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '@entities/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (
        requestType: JwtSecretRequestType,
        token: string,
        done: Function
      ): Promise<string> => {
        const jwtUtility: JwtUtility = new JwtUtility(),
          tokenValues: JwtPayload = jwtUtility.decodeJwtToken<JwtPayload>(token),
          user: User = await authService.findUserFromJwtPayload(tokenValues);

        if (!user) {
          return done(new UnauthorizedException('Invalid auth token'), null);
        }

        return done(null, jwtUtility.returnDyanmicSigningKey(user.session_salt));
      }
    });
  }

  async validate(payload: JwtPayload) {
    const user: User = await this.authService.findUserFromJwtPayload(payload);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired auth token');
    }

    return payload;
  }
}