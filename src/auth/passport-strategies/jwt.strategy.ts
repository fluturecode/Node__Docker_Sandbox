import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

import environment from '../../environment';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../entities/user/user.respository';
import { User } from 'src/entities/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.jwt_secret
    });
  }

  async validate(payload: JwtPayload) {
    const { id, email, userHash } = payload,
      user: User = await this.userRepository.findOne({
        id,
        email,
        session_salt: userHash
      });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired auth token');
    }

    return { id, email, userHash };
  }
}