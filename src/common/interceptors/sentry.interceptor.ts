import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import environment from '@environment';

import * as sentry from '@sentry/node';

export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        tap(null, exception => {
          if (exception.status >= 500 && environment.node_env === 'production') {
            sentry.captureException(exception);
          }
        })
      );
  }
}