import { Request, Response } from 'express';
import { ensureFullPath, scrubData } from './logging.helper';

import { User } from '@entities';

import environment from '@environment';

import * as _ from 'lodash';
import * as fs from 'fs';
import * as moment from 'moment';
import * as morgan from 'morgan';

export class EventLogger {
  private defaultFormat: string = ':date - Method: :method Url: :url HTTP/:http-version - Address: :remote-addr - Agent: :user-agent';
  private keysToScrub: string[] = ['jwt_token', 'password'];
  private requestEventLogger;
  private responseEventLogger;

  constructor() {
    ensureFullPath(`${environment.error_logs_directory}/event-logs`);
  }

  public logIncomingRequest(request: Request, response: Response) {
    const requestUser: {user: User} = JSON.parse(scrubData(
      this.stringifyPayloadWithSpace(request.user),
      this.keysToScrub
    ));

    const requestFormat: string = `Incoming Request: ${this.defaultFormat} - UserId: ${_.get(requestUser, 'user.id', 'Unknown User')}`;

    this.requestEventLogger = morgan(requestFormat, {
      stream: fs.createWriteStream(
        `${environment.error_logs_directory}/event-logs/${moment().format('YYYY-MM-DD')}-requests.log`,
        { flags: 'a' }
      )
    });

    this.requestEventLogger(request, response,  () => {});
  }

  public logServerResponse(request: Request, response: Response, data?: any) {
    const requestUser: {user: User} = JSON.parse(scrubData(
      this.stringifyPayloadWithSpace(request.user),
      this.keysToScrub
    ));

    const responseFormat: string = `Server Response: ${this.defaultFormat} - UserId: ${_.get(requestUser, 'user.id', 'Unknown User')} - Status: ${data.status || response.statusCode}`;

    this.responseEventLogger = morgan(responseFormat, {
      stream: fs.createWriteStream(
        `${environment.error_logs_directory}/event-logs/${moment().format('YYYY-MM-DD')}-requests.log`,
        { flags: 'a' }
      )
    });

    this.responseEventLogger(request, response, () => {});
  }

  private stringifyPayloadWithSpace(payload: object): string {
    if (payload) {
      return JSON.stringify(payload, null, 1).replace(/\n/g, '');
    }

    return "null";
  }
}