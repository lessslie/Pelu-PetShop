import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'La aplicación está corriendo en: http://localhost:3001/api';
  }
}
