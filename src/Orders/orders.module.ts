import { Module } from '@nestjs/common';
import { OrdersService } from 'src/Orders/orders.service';
import { OrdersController } from 'src/Orders/orders.controller';
import { SupabaseProvider } from 'src/config/supabase.config';
import { ProductsModule } from 'src/Products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [OrdersService, SupabaseProvider],
  controllers: [OrdersController],
})
export class OrdersModule {}