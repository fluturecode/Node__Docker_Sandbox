import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { S3BaseEntity } from '@entities';

import * as _ from 'lodash';

export enum UserRoles {
  ADMIN       = 'Admin',
  EDITOR      = 'Editor',
  USER        = 'User',
  SUPER_ADMIN = 'Super Administrator'
}

@Entity()
export class Role extends S3BaseEntity {
  @ApiProperty()
  @Column({
    type: 'enum',
    enum: UserRoles,
    nullable: false
  })
  roleName: UserRoles;

  get allowedUserRoles(): UserRoles[] {
    return _.reduce(UserRoles, (result: UserRoles[], value: UserRoles) => {
      if (this.canAccessRole(this.roleName, value)) {
        result.push(value);
      }

      return result;
    }, []);
  }

  public canAccessRole(userRole: UserRoles, accessedRole: UserRoles): boolean {
    return this.determineRoleHierarchy(userRole) >= this.determineRoleHierarchy(accessedRole);
  }

  private determineRoleHierarchy(role: UserRoles): number {
    switch (role) {
      case (UserRoles.SUPER_ADMIN):
        return 4;
      case (UserRoles.ADMIN):
        return 3;
      case (UserRoles.EDITOR):
        return 2;
      case (UserRoles.USER):
        return 1;
      default:
        return 0;
    }
  }
}