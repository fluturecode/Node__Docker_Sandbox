import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '@entities';

import * as _ from 'lodash';

@Injectable()
export class HasRoleGuard implements CanActivate {
  errorLogger: ErrorLogger = new ErrorLogger('RoleGuard');

  constructor(
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPassedToGuard: string[] = this.reflector.get<string[]>('requiredRoles', context.getHandler()) || [],
      request: Request = context.switchToHttp().getRequest(),
      currentRoute: string = request.path,
      method: string = request.method;

    if (!rolesPassedToGuard.length) {
      return true;
    }

    const user: User = _.get(request, 'user') as User,
      userRole: string = _.get(user, 'role.roleName'),
      canAccess: boolean = rolesPassedToGuard.includes(userRole);

    if (!canAccess) {
      const errorMessage: string = `${method} ${currentRoute} requires the following roles: ${rolesPassedToGuard.join('|')}, but was requested with the role of ${userRole}. User Info - Id: ${user?.id}, UserName: ${user?.getFullName()}`;

      this.errorLogger.log({
        level: 'info',
        message: errorMessage
      });

      throw new ForbiddenException(errorMessage);
    }

    return true;
  }
}