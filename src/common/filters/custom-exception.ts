import { HttpException } from "@nestjs/common";

import environment from '@environment';

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export const ErrorCodes = {
  401: 'Invalid authorization token',
  403: 'Permission denied',
  404: 'Endpoint or entity not found',
  405: 'Method not allowed',
  413: 'Payload size exceeds server limit',
  500: 'Internal server error',
  502: 'Bad gateway',
  503: 'Service temporarily unavailable',
  504: 'Gateway timeout'
};

export class CustomException {
  private isProduction: boolean = environment.node_env !== 'development';
  public errorResponse: ErrorResponse = {
    statusCode: 500,
    message: ErrorCodes[500],
    error: 'Internal Server Error'
  };

  constructor(exception: HttpException | unknown) {
    Object.assign(this.errorResponse, exception['response']);

    if (this.isProduction && this.errorResponse.statusCode > 400) {
      this.errorResponse.message = ErrorCodes[this.errorResponse.statusCode];
    }
  }
}