import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  returnHealthCheck(): string {
    return 'Server up and healthy!';
  }
}
