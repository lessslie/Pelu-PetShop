// test-mail.ts
import { MailService } from './src/Mails/mail.service';
import { ConfigService } from '@nestjs/config';

async function testMail() {
  // Crea un config service simple para pruebas
  const configService = {
    get: (key: string) => {
      return process.env[key];
    }
  } as ConfigService;

  const mailService = new MailService(configService);
  
  try {
    await mailService.sendAppointmentConfirmation(
      'agata.morales92@gmail.com', // Correo donde quieres recibir la prueba
      'Cliente de Prueba',
      'Firulais',
      '2025-05-01',
      '14:00',
      'medium',
      'bath'
    );
    console.log('Correo enviado correctamente');
  } catch {
    console.error('Error al enviar correo:');
  }
}

// Cargar variables de entorno
require('dotenv').config();

// Ejecutar la prueba
testMail();