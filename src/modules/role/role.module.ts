import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleController } from './role.controller';
import { RoleRepository } from '@models';
import { RoleService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleRepository
    ])
  ],
  controllers: [
    RoleController
  ],
  providers: [
    RoleService
  ]
})
export class RoleModule {}
