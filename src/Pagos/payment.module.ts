import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TurnosModule } from '../turnos/turnos.module';
import { MailModule } from 'src/Mails/mail.module';
import { MailService } from '../Mails/mail.service';
import { SupabaseProvider } from '../config/supabase.config';
import { ServiciosService } from '../servicios/servicios.service';

@Module({
  imports: [ConfigModule, forwardRef(() => TurnosModule), MailModule],
  providers: [PaymentService, MailService, SupabaseProvider, ServiciosService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}