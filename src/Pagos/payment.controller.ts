import { Controller, Post, Body, Param, Get, Req, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TurnosService } from '../turnos/turnos.service';
import { MailService } from 'src/Mails/mail.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private turnosService: TurnosService,
    private mailService: MailService,
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient,
  ) {}

  @Post('create/:turnoId')
  @ApiOperation({ summary: 'Crear preferencia de pago para un turno' })
  @ApiResponse({ status: 201, description: 'Preferencia de pago creada correctamente' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado' })
  async createPayment(@Param('turnoId') turnoId: string) {
    // Obtener información del turno
    const { data: turnoData, error: turnoError } = await this.supabaseClient
      .from('turnos')
      .select('*')
      .eq('id', turnoId)
      .single();
      
    if (turnoError || !turnoData) {
      throw new Error('Turno no encontrado');
    }

    // Obtener información del usuario
    const { data: userData, error: userError } = await this.supabaseClient
      .from('users')
      .select('email, "firstName", "lastName"')
      .eq('id', turnoData.user_id)
      .single();
      
    if (userError || !userData) {
      throw new Error('Usuario no encontrado');
    }

    // --- Mapeo robusto de serviceType y dogSize ---
    let serviceType = 'bath';
    if (turnoData.service_type && turnoData.service_type.toUpperCase() === 'BATH_AND_CUT') {
      serviceType = 'bath and cut';
    }
    let dogSize = 'small';
    if (turnoData.dog_size && turnoData.dog_size.toUpperCase() === 'MEDIUM') {
      dogSize = 'medium';
    } else if (turnoData.dog_size && turnoData.dog_size.toUpperCase() === 'LARGE') {
      dogSize = 'large';
    }
    // ---------------------------------------------

    // Crear preferencia de pago
    const preference = await this.paymentService.createPaymentPreference(
      turnoId,
      turnoData.dog_name,
      serviceType,
      dogSize,
      turnoData.date,
      turnoData.time,
      userData.email,
    );

    return preference;
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook para recibir notificaciones de pagos' })
  @ApiResponse({ status: 200, description: 'Notificación procesada correctamente' })
  async handleWebhook(@Body() body: any, @Req() req: any) {
    console.log('Webhook recibido:', body);
    
    // Procesar la notificación del webhook
    const paymentInfo = await this.paymentService.processWebhook(body);
    
    if (paymentInfo && paymentInfo.status === 'approved') {
      // Actualizar el estado del turno a "pagado" en la base de datos
      const { data, error } = await this.supabaseClient
        .from('turnos')
        .update({ payment_status: 'paid', payment_id: paymentInfo.paymentId })
        .eq('id', paymentInfo.turnoId)
        .select()
        .single();
        
      if (!error) {
        // Obtener información del usuario para enviar correo de confirmación de pago
        const { data: userData } = await this.supabaseClient
          .from('users')
          .select('email, "firstName", "lastName"')
          .eq('id', data.user_id)
          .single();
          
        if (userData) {
          // Enviar correo de confirmación de pago
          await this.mailService.sendPaymentConfirmation(
            userData.email,
            `${userData.firstName} ${userData.lastName}`,
            data.dog_name,
            data.date,
            data.time,
            data.dog_size.toLowerCase(),
            data.service_type.toLowerCase() === 'BATH' ? 'bath' : 'bath and cut',
            paymentInfo.paymentId,
            data.price
          );
        }
      }
    }
    
    return { success: true };
  }

  @Get('status/:paymentId')
  @ApiOperation({ summary: 'Obtener estado de un pago' })
  @ApiResponse({ status: 200, description: 'Estado del pago obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentStatus(paymentId);
  }
}