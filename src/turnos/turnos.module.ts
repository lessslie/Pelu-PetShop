import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { SupabaseProvider } from '../config/supabase.config';
import { MailModule } from '../Mails/mail.module';

@Module({
  imports: [MailModule],
  providers: [TurnosService, SupabaseProvider],
  controllers: [TurnosController],
  exports: [TurnosService],
})
export class TurnosModule {}
