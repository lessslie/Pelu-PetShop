import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { ServiciosService } from '../servicios/servicios.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PaymentService {
  private mercadoPagoClient: MercadoPagoConfig;
  private preference: Preference;
  private payment: Payment;

  constructor(
    private configService: ConfigService,
    private serviciosService: ServiciosService,
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient
  ) {
    // Configurar MercadoPago con la clave de acceso
    this.mercadoPagoClient = new MercadoPagoConfig({
      accessToken: this.configService.get('MERCADO_PAGO_ACCESS_TOKEN'),
    });
    this.preference = new Preference(this.mercadoPagoClient);
    this.payment = new Payment(this.mercadoPagoClient);
  }

  /**
   * Calcula el precio del servicio basado en el tamaño del perro y tipo de servicio
   * Lee los precios dinámicamente desde servicios.json y hace mapeo explícito
   */
  calculatePrice(dogSize: string, serviceType: string): number {
    const precios = this.serviciosService.getPrecios();

    // Mapeo explícito
    const sizeMap: Record<string, string> = {
      small: 'perro_chico',
      medium: 'perro_mediano',
      large: 'perro_grande',
    };
    const typeMap: Record<string, string> = {
      bath: 'bano',
      'bath and cut': 'bano_corte',
    };

    const sizeKey = sizeMap[dogSize.toLowerCase()];
    const typeKey = typeMap[serviceType.toLowerCase()];

    if (!sizeKey || !typeKey) return 0;

    return precios[typeKey]?.[sizeKey] ?? 0;
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
    // LOG para depuración
    console.log('Precio calculado:', price);
    console.log('Datos de precios:', this.serviciosService.getPrecios());
    console.log('dogSize:', dogSize, 'serviceType:', serviceType);
    if (!price || price <= 0) {
      throw new Error(`Precio inválido para el servicio (${serviceType}) y tamaño (${dogSize}).`);
    }
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
    } catch (err) {
      console.error('Error al crear preferencia de pago:', err);
      throw new Error('Error al crear preferencia de pago');
    }
  }

  /**
   * Crea una preferencia de pago en Mercado Pago para productos del carrito
   */
  async createProductOrderPreference(orderId: string, items: { name: string, price: number, quantity: number, image?: string }[], userEmail: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const backendUrl = this.configService.get('BACKEND_URL', `${process.env.NEXT_PUBLIC_API_URL}`);
    // Adaptar los items al formato de Mercado Pago
    const mpItems = items.map((item, idx) => ({
      id: `${orderId}-${idx}`,
      title: item.name,
      description: item.name,
      quantity: item.quantity,
      currency_id: 'ARS',
      unit_price: item.price,
      picture_url: item.image || undefined,
    }));
    const preferenceData = {
      items: mpItems,
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${frontendUrl}/payment/success`,
        failure: `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${backendUrl}/payment/webhook`,
    };
    try {
      const response = await this.preference.create({ body: preferenceData });
      return response;
    } catch (err) {
      console.error('Error al crear preferencia de pago para productos:', err);
      throw new Error('Error al crear preferencia de pago para productos');
    }
  }

  /**
   * Procesa el webhook de Mercado Pago
   * Si el pago es aprobado, actualiza el estado del turno a 'paid' en la base de datos
   */
  async processWebhook(data: any) {
    if (data.type === 'payment') {
      try {
        const paymentInfo = await this.payment.get({ id: data.id });
        const paymentStatus = paymentInfo.status;
        const externalReference = paymentInfo.external_reference; // ID del turno

        // Mapear estado de MercadoPago a tu modelo
        let newStatus = 'pending';
        if (paymentStatus === 'approved') {
          newStatus = 'paid';
        } else if (paymentStatus === 'refunded') {
          newStatus = 'refunded';
        } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
          newStatus = 'failed';
        }

        // Actualizar el turno en la base de datos
        const { error: updateError } = await this.supabaseClient
          .from('turnos')
          .update({
            payment_status: newStatus,
            payment_id: data.id,
            payment_date: new Date().toISOString(),
          })
          .eq('id', externalReference);

        if (updateError) {
          console.error('Error al actualizar el estado de pago del turno:', updateError);
        }

        return {
          turnoId: externalReference,
          status: paymentStatus,
          paymentId: data.id,
          paymentDetails: paymentInfo,
        };
      } catch (err) {
        console.error('Error al procesar webhook:', err);
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