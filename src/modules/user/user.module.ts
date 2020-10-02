import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository, RoleRepository, AgencyRepository } from '@models';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgencyRepository,
      RoleRepository,
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
