import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '@entities';

import environment from '@environment';

import * as _ from 'lodash';

@Injectable()
export class HasRoleGuard implements CanActivate {
  errorLogger: ErrorLogger = new ErrorLogger('RoleGuard');
  isProduction: boolean = environment.node_env === 'production';

  constructor(
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPassedToGuard: string[] = this.reflector.get<string[]>('requiredRoles', context.getHandler()),
      request: Request = context.switchToHttp().getRequest(),
      currentRoute: string = request.path,
      method: string = request.method;

    if (!rolesPassedToGuard) {
      return true;
    }

    const user: User = _.get(request, 'user') as User,
      userRole: string = _.get(user, 'role.roleName'),
      canAccess: boolean = rolesPassedToGuard.includes(userRole);

    if (!canAccess) {
      return this.returnUnathorizedMessage(
        `${method} ${currentRoute} requires the following roles: ${rolesPassedToGuard.join('|')}, but was requested with the role of ${userRole}. User Info - Id: ${user?.id}, UserName: ${user?.getFullName()}`
      );
    }

    return true;
  }

  returnUnathorizedMessage(message: string): boolean {
    this.errorLogger.log({
      level: 'info',
      message
    });

    if (this.isProduction) {
      throw new ForbiddenException('Forbidden resource');
    }

    throw new ForbiddenException(message);
  }
}