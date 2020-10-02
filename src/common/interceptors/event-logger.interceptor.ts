import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { EventLogger } from '@utilities/logging/event-logger.utility';

export class EventLoggerInterceptor implements NestInterceptor {
  eventLogger: EventLogger = new EventLogger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest<Request>(),
      response: Response = context.switchToHttp().getResponse<Response>();

    this.eventLogger.logIncomingRequest(request, response);

    return next
      .handle()
      .pipe(
        tap((data) => {
          this.eventLogger.logServerResponse(request, response, {payload: data});
        }),
      );
  }
}