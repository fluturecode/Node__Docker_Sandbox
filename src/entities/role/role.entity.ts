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

const RoleHierarchy = {
  [`${UserRoles.SUPER_ADMIN}`]: 4,
  [`${UserRoles.ADMIN}`]:       3,
  [`${UserRoles.EDITOR}`]:      2,
  [`${UserRoles.USER}`]:        1
};

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
      if (this.canAccessRole(value)) {
        result.push(value);
      }

      return result;
    }, []);
  }

  public canAccessRole(roleName: UserRoles): boolean {
    if (!roleName) {
      return false;
    }

    if (roleName in RoleHierarchy) {
      return RoleHierarchy[this.roleName] >= RoleHierarchy[roleName];
    }

    return false;
  }
}