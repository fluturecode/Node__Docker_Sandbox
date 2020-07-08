import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventLogger } from '@utilities/logging/event-logger.utility';
import { Request, Response } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  eventLogger: EventLogger = new EventLogger();

  handleRequest(err, user, info, context: any) {
    if (err || !user) {
      const request: Request = context.getRequest(),
        response: Response = context.getResponse();

      this.eventLogger.logIncomingRequest(request, response);
      this.eventLogger.logServerResponse(request, response, {status: 401});

      throw err || new UnauthorizedException();
    }

    return user;
  }
}