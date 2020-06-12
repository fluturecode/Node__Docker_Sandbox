import * as winston from 'winston';
import * as moment from 'moment';

import environment from '@environment';

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

  constructor(service?: string) {
    this.combinedLogsPath = `${this.serverLogsPath}/${moment().format('MM-DD-YYYY')}-combined.log`;
    this.errorLogPath = `${this.serverLogsPath}/${moment().format('MM-DD-YYYY')}-errors.log`;

    this.setupLogger(service);
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
          filename: this.combinedLogsPath,
          handleExceptions: true
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
    if (logConfig.error) {
      logConfig.message += ' - Error: ';
    }

    this.winstonLogger.log(
      logConfig.level || 'info',
      logConfig.message,
      logConfig.error
    );
  }

}