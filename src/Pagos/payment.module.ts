import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TurnosModule } from '../turnos/turnos.module';
import { TurnosService } from '../turnos/turnos.service';
import { MailModule } from 'src/Mails/mail.module';
import { MailService } from '../Mails/mail.service';
import { SupabaseProvider } from '../config/supabase.config';

@Module({
  imports: [ConfigModule, TurnosModule, MailModule],
  providers: [PaymentService, TurnosService, MailService, SupabaseProvider],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}