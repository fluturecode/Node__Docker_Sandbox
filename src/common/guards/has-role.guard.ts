import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User, UserRoles } from '@models';

@Injectable()
export class HasRoleGuard implements CanActivate {
  errorLogger: ErrorLogger = new ErrorLogger('RoleGuard');

  constructor(
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPassedToGuard: UserRoles[] = this.reflector.get<UserRoles[]>('requiredRoles', context.getHandler()) || [],
      request: Request = context.switchToHttp().getRequest(),
      currentRoute: string = request.path,
      method: string = request.method;

    if (!rolesPassedToGuard.length) {
      return true;
    }

    const user: User = request.user as User;

    if (!user) {
      throw new ForbiddenException(`Access denied.`);
    }

    if (!user.hasRoleInRoleList(rolesPassedToGuard)) {
      const errorMessage: string = `${method} ${currentRoute} requires the following roles: ${rolesPassedToGuard.join('|')}, but was requested with the role of ${user.role.roleName}. User Info - Id: ${user.id}, UserName: ${user.getFullName()}`;

      this.errorLogger.log({
        level: 'info',
        message: errorMessage
      });

      throw new ForbiddenException(errorMessage);
    }

    return true;
  }
}