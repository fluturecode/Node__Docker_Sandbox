import { Request, Response } from 'express';

import environment from '@environment';

import * as fs from 'fs';
import * as moment from 'moment';
import * as morgan from 'morgan';

import { ensureFullPath, scrubData } from './logging.helper';

export class EventLogger {
  private defaultFormat: string = ':date - Method: :method Url: :url HTTP/:http-version - Address: :remote-addr - Agent: :user-agent';
  private requestEventLogger;
  private responseEventLogger;

  constructor() {
    ensureFullPath(`${environment.error_logs_directory}/event-logs`);
  }

  public logIncomingRequest(request: Request, response: Response) {
    const requestUser: string = scrubData(
      JSON.stringify(request.user),
      ['jwt_token', 'password']
    );

    let requestFormat: string = `Incoming Request: ${this.defaultFormat} - User: ${requestUser}`;

    if (['POST', 'PUT'].includes(request.method)) {
      requestFormat += scrubData(
        ` - Request Body: ${JSON.stringify(request.body)}`,
        ['jwt_token', 'password']
      );
    }

    this.requestEventLogger = morgan(requestFormat, {
      stream: fs.createWriteStream(
        `${environment.error_logs_directory}/event-logs/${moment().format('YYYY-MM-DD')}-requests.log`,
        { flags: 'a' }
      )
    });

    this.requestEventLogger(request, response, () => {});
  }

  private ensureLogPathExists(path: string) {
    const pathSplit: string[] = path.split('/');

    pathSplit.reduce((currentPath: string, nextFolder: string) => {
      if (nextFolder) {
        currentPath += `/${nextFolder}`;

        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
      }

      return currentPath;
    }, '');
  }

  public logServerResponse(request: Request, response: Response, data?: any) {
    const requestUser: string = scrubData(
      JSON.stringify(request.user),
      ['jwt_token', 'password']
    );

    let responseFormat: string = `Server Response: ${this.defaultFormat} - User: ${requestUser} - Status: ${data.status || response.statusCode}`;

    if (data.payload) {
      responseFormat += scrubData(
        ` - Response Payload: ${JSON.stringify(data.payload)}`,
        ['jwt_token', 'password']
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
}