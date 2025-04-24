import { Module } from '@nestjs/common';
import { SupabaseProvider } from './supabase.config';

@Module({
  providers: [SupabaseProvider],
  exports: [SupabaseProvider],
})
export class SupabaseModule {}