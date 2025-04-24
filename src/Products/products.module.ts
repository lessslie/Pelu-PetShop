import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SupabaseProvider } from '../config/supabase.config';

@Module({
  providers: [ProductsService, SupabaseProvider],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}