import { Request, Response } from 'express';

import environment from '@environment';

import * as fs from 'fs';
import * as moment from 'moment';
import * as morgan from 'morgan';

import { ensureFullPath, scrubData } from './logging.helper';

export class EventLogger {
  private defaultFormat: string = ':date - Method: :method Url: :url HTTP/:http-version - Address: :remote-addr - Agent: :user-agent';
  private keysToScrub: string[] = ['jwt_token', 'password'];
  private requestEventLogger;
  private responseEventLogger;

  constructor() {
    ensureFullPath(`${environment.error_logs_directory}/event-logs`);
  }

  public logIncomingRequest(request: Request, response: Response) {
    const requestUser: string = scrubData(
      this.stringifyPayloadWithSpace(request.user),
      this.keysToScrub
    );

    let requestFormat: string = `Incoming Request: ${this.defaultFormat} - User: ${requestUser}`;

    if (['POST', 'PUT'].includes(request.method)) {
      requestFormat += scrubData(
        ` - Request Body: ${this.stringifyPayloadWithSpace(request.body)}`,
        this.keysToScrub
      );
    }

    this.requestEventLogger = morgan(requestFormat, {
      stream: fs.createWriteStream(
        `${environment.error_logs_directory}/event-logs/${moment().format('YYYY-MM-DD')}-requests.log`,
        { flags: 'a' }
      )
    });

    this.requestEventLogger(request, response,  () => {});
  }

  public logServerResponse(request: Request, response: Response, data?: any) {
    const requestUser: string = scrubData(
      this.stringifyPayloadWithSpace(request.user),
      this.keysToScrub
    );

    let responseFormat: string = `Server Response: ${this.defaultFormat} - User: ${requestUser} - Status: ${data.status || response.statusCode}`;

    if (data.payload) {
      responseFormat += scrubData(
        ` - Response Payload: ${this.stringifyPayloadWithSpace(data.payload)}`,
        this.keysToScrub
      );
    }

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