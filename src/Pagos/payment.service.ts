import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

@Injectable()
export class PaymentService {
  private mercadoPagoClient: MercadoPagoConfig;
  private preference: Preference;
  private payment: Payment;

  constructor(private configService: ConfigService) {
    // Configurar MercadoPago con la clave de acceso
    this.mercadoPagoClient = new MercadoPagoConfig({
      accessToken: this.configService.get('MERCADO_PAGO_ACCESS_TOKEN'),
    });
    this.preference = new Preference(this.mercadoPagoClient);
    this.payment = new Payment(this.mercadoPagoClient);
  }

  /**
   * Calcula el precio del servicio basado en el tamaño del perro y tipo de servicio
   */
  calculatePrice(dogSize: string, serviceType: string): number {
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
    
    return price;
  }

  /**
   * Crea una preferencia de pago en Mercado Pago
   */
  async createPaymentPreference(
    turnoId: string,
    dogName: string,
    serviceType: string,
    dogSize: string,
    date: string,
    time: string,
    userEmail: string,
  ) {
    const price = this.calculatePrice(dogSize, serviceType);
    
    // Formatear la fecha para mostrarla en la descripción
    const formattedDate = new Date(date).toLocaleDateString('es-AR');

    // LOG para depurar FRONTEND_URL y BACKEND_URL
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const backendUrl = this.configService.get('BACKEND_URL', `${process.env.NEXT_PUBLIC_API_URL}`);
    console.log('FRONTEND_URL:', frontendUrl);
    console.log('BACKEND_URL:', backendUrl);
    
    // Crear la preferencia de pago
    const preferenceData = {
      items: [
        {
          id: turnoId,
          title: `Servicio de ${serviceType === 'bath' ? 'baño' : 'baño y corte'} para ${dogName}`,
          description: `Turno para el ${formattedDate} a las ${time}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: price,
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${frontendUrl}/payment/success`,
        failure: `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: turnoId,
      notification_url: `${backendUrl}/payment/webhook`,
    };

    try {
      const response = await this.preference.create({ body: preferenceData });
      return response;
    } catch {
      console.error('Error al crear preferencia de pago:');
      throw new Error('Error al crear preferencia de pago');
    }
  }

  /**
   * Procesa el webhook de Mercado Pago
   */
  async processWebhook(data: any) {
    if (data.type === 'payment') {
      try {
        const paymentInfo = await this.payment.get({ id: data.id });
        const paymentStatus = paymentInfo.status;
        const externalReference = paymentInfo.external_reference; // ID del turno
        
        return {
          turnoId: externalReference,
          status: paymentStatus,
          paymentId: data.id,
          paymentDetails: paymentInfo,
        };
      } catch {
        console.error('Error al procesar webhook:');
        throw new Error('Error al procesar webhook');
      }
    }
    
    return null;
  }

  /**
   * Verifica el estado de un pago
   */
  async getPaymentStatus(paymentId: string) {
    try {
      const paymentInfo = await this.payment.get({ id: paymentId });
      return paymentInfo;
    } catch {
      console.error('Error al obtener estado del pago:');
      throw new Error('Error al obtener estado del pago');
    }
  }
}