import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './passport-strategies/jwt.strategy';
import { LocalStrategy } from './passport-strategies/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '@entities/user/user.respository';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    TypeOrmModule.forFeature([
      UserRepository
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy
  ]
})
export class AuthModule {}
