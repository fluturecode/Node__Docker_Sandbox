import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../entities/user/user.respository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository
    ])
  ],
  providers: [
    UserService
  ],
  controllers: [
    UserController
  ]
})
export class UserModule {}
