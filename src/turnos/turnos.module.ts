import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { SupabaseProvider } from '../config/supabase.config';

@Module({

  providers: [TurnosService, SupabaseProvider],
  controllers: [TurnosController],
  exports: [TurnosService],
})
export class TurnosModule {}
