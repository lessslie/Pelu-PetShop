import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'La aplicación está corriendo en: ${process.env.NEXT_PUBLIC_API_URL}/api y/o en https://pelu-petshop.onrender.com/api';
  }
}
