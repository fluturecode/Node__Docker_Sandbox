import * as moment from 'moment';
import * as winston from 'winston';

import environment from '@environment';
import { ensureFullPath, scrubData } from './logging.helper';

export interface LogConfig {
  error?: Error;
  level?: string;
  message: string;
}

export class ErrorLogger {
  combinedLogsPath: string;
  errorLogPath: string;
  serverLogsPath: string = environment.error_logs_directory;
  winstonLogger: winston.Logger;

  constructor(serviceName?: string) {
    this.combinedLogsPath = `${this.serverLogsPath}/error-logs/${moment().format('YYYY-MM-DD')}-combined.log`;
    this.errorLogPath = `${this.serverLogsPath}/error-logs/${moment().format('YYYY-MM-DD')}-errors.log`;

    ensureFullPath(`${this.serverLogsPath}/error-logs`);

    this.setupLogger(serviceName);
  }

  public addStream(path: string) {
    this.winstonLogger.add(
      new winston.transports.File({
        format: this.levelFilter('error'),
        filename: `${this.serverLogsPath}/${path}`,
      })
    );
  }

  private setupLogger(service?: string): void {
    this.winstonLogger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'MM-DD-YYYY HH:mm:ss'
        }),
        winston.format.json()
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.File({
          format: this.levelFilter('error'),
          filename: this.combinedLogsPath
        }),
        new winston.transports.File({
          filename: this.errorLogPath,
          level: 'error'
        })
      ]
    });
  }

  // This returns the winston FormatWrapper but the type is not exported by the module
  private levelFilter(level: string) {
    return winston.format((info, opts) => {
      if (info && info.level === level) return false;

      return info;
    })();
  }

  public log(logConfig: LogConfig): void {
    if (environment.node_env === 'test') {
      return;
    }

    if (logConfig.error) {
      logConfig.message += ' - Error: ';
    }

    this.winstonLogger.log(
      logConfig.level || 'info',
      scrubData(logConfig.message, ['jwtToken', 'password']),
      logConfig.error
    );

    this.winstonLogger.clear();
  }
}