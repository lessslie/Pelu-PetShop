import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Turno } from 'src/turnos/turnos.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configurar el transporter de nodemailer
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendAppointmentConfirmation(
    to: string,
    userName: string,
    dogName: string,
    date: string,
    time: string,
    dogSize: string,
    serviceType: string,
  ): Promise<void> {
    // Calcular el precio basado en el tamaño del perro y tipo de servicio
    let price = 0;
    
    if (serviceType.toLowerCase() === 'bath') {
      switch (dogSize.toLowerCase()) {
        case 'small':
          price = 2500;
          break;
        case 'medium':
          price = 3000;
          break;
        case 'large':
          price = 3500;
          break;
      }
    } else if (serviceType.toLowerCase() === 'bath and cut') {
      switch (dogSize.toLowerCase()) {
        case 'small':
          price = 3500;
          break;
        case 'medium':
          price = 4000;
          break;
        case 'large':
          price = 4500;
          break;
      }
    }

    // Formatear la fecha
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Crear el contenido del correo
    const mailOptions = {
      from: `"Pet Shop" <${this.configService.get('MAIL_FROM')}>`,
      to,
      subject: '¡Confirmación de tu turno en Pet Shop!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3f51b5; text-align: center;">¡Reserva Confirmada!</h2>
          <p>Hola ${userName},</p>
          <p>¡Tu turno para ${dogName} ha sido reservado con éxito!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3f51b5;">Detalles de la reserva:</h3>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
            <p><strong>Hora:</strong> ${time}</p>
            <p><strong>Mascota:</strong> ${dogName}</p>
            <p><strong>Tamaño:</strong> ${dogSize}</p>
            <p><strong>Servicio:</strong> ${serviceType}</p>
            <p><strong>Precio estimado:</strong> $${price}</p>
          </div>
          <p>Para confirmar tu reserva, debes realizar el pago. Puedes hacerlo a través del siguiente enlace:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/payment/checkout/${dogName}" style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Realizar Pago</a>
          </div>
          <p>Por favor, llega 10 minutos antes de tu cita. Si necesitas cancelar o reprogramar, háznoslo saber con al menos 24 horas de anticipación.</p>
          <p>¡Esperamos verte pronto!</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #757575; font-size: 12px;">Pet Shop</p>
            <p style="color: #757575; font-size: 12px;">Dirección: Av. Principal 123, Ciudad</p>
            <p style="color: #757575; font-size: 12px;">Teléfono: (123) 456-7890</p>
          </div>
        </div>
      `,
    };

    // Enviar el correo
    try {
      await this.transporter.sendMail(mailOptions);
    } catch {
      console.error('Error al enviar el correo:');
      throw new Error('Error al enviar el correo');
    }
  }
  async sendTurnoEditadoEmail(email: string, turno: Turno) {
    await this.transporter.sendMail({
      to: email,
      subject: 'Tu turno fue modificado',
      html: `
        <p>¡Hola! Te informamos que tu turno fue modificado:</p>
        <ul>
          <li><b>Mascota:</b> ${turno.dogName}</li>
          <li><b>Fecha:</b> ${turno.date}</li>
          <li><b>Hora:</b> ${turno.time}</li>
          <li><b>Tamaño:</b> ${turno.dogSize}</li>
          <li><b>Servicio:</b> ${turno.serviceType}</li>
        </ul>
        <p>Si tienes dudas, contáctanos.</p>
      `
    });
  }

  async sendPaymentConfirmation(
    to: string,
    userName: string,
    dogName: string,
    date: string,
    time: string,
    dogSize: string,
    serviceType: string,
    paymentId: string,
  ): Promise<void> {
    // Calcular el precio basado en el tamaño del perro y tipo de servicio
    let price = 0;
    
    if (serviceType.toLowerCase() === 'bath') {
      switch (dogSize.toLowerCase()) {
        case 'small':
          price = 2500;
          break;
        case 'medium':
          price = 3000;
          break;
        case 'large':
          price = 3500;
          break;
      }
    } else if (serviceType.toLowerCase() === 'bath and cut') {
      switch (dogSize.toLowerCase()) {
        case 'small':
          price = 3500;
          break;
        case 'medium':
          price = 4000;
          break;
        case 'large':
          price = 4500;
          break;
      }
    }

    // Formatear la fecha
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Crear el contenido del correo
    const mailOptions = {
      from: `"Pet Shop" <${this.configService.get('MAIL_FROM')}>`,
      to,
      subject: '¡Pago confirmado para tu turno en Pet Shop!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3f51b5; text-align: center;">¡Pago Confirmado!</h2>
          <p>Hola ${userName},</p>
          <p>Hemos recibido tu pago y tu turno para ${dogName} está completamente confirmado. ¡Gracias por tu confianza!</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3f51b5;">Detalles de la reserva:</h3>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
            <p><strong>Hora:</strong> ${time}</p>
            <p><strong>Mascota:</strong> ${dogName}</p>
            <p><strong>Tamaño:</strong> ${dogSize}</p>
            <p><strong>Servicio:</strong> ${serviceType}</p>
            <p><strong>Precio pagado:</strong> $${price}</p>
            <p><strong>ID de pago:</strong> ${paymentId}</p>
          </div>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #2e7d32;">Información importante:</h3>
            <p>Tu turno ya está confirmado y no se requiere ninguna acción adicional.</p>
            <p>Por favor, llega 10 minutos antes de tu cita.</p>
            <p>Si necesitas cancelar o reprogramar, háznoslo saber con al menos 24 horas de anticipación para gestionar el reembolso.</p>
          </div>
          
          <p>¡Esperamos verte pronto!</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #757575; font-size: 12px;">Pet Shop</p>
            <p style="color: #757575; font-size: 12px;">Dirección: Av. Principal 123, Ciudad</p>
            <p style="color: #757575; font-size: 12px;">Teléfono: (123) 456-7890</p>
          </div>
        </div>
      `,
    };

    // Enviar el correo
    try {
      await this.transporter.sendMail(mailOptions);
    } catch {
      console.error('Error al enviar el correo de confirmación de pago:');
      throw new Error('Error al enviar el correo de confirmación de pago');
    }
  }
}