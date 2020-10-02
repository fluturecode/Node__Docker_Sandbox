import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { ErrorLogger } from '@utilities/logging/error-logger.utility';
import { Request } from 'express';
import { User } from '@models';

import * as _ from 'lodash';

@Injectable()
export class SameUserGuard implements CanActivate {
  errorLogger: ErrorLogger = new ErrorLogger('SameUserGuard');

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest(),
      requestingUser: User = request.user as User,
      userId: number = parseInt(request.params.id);

    if (!userId) {
      throw new InternalServerErrorException(`Expected a userId in request params but got: ${userId}`);
    }

    if (requestingUser.id !== userId) {
      const errorMessage: string = `Cannot access userId: ${userId} with requesting userId: ${requestingUser.id}`;

      this.errorLogger.log({ message: errorMessage });

      throw new ForbiddenException(errorMessage);
    }

    return true;
  }
}