import { Module } from '@nestjs/common';
import { OrdersService } from 'src/Orders/orders.service';
import { OrdersController } from 'src/Orders/orders.controller';
import { SupabaseProvider } from 'src/config/supabase.config';
import { ProductsModule } from 'src/Products/products.module';
import { PaymentModule } from 'src/Pagos/payment.module';
import { UsersService } from 'src/Users/users.service';

@Module({
  imports: [ProductsModule, PaymentModule],
  providers: [OrdersService, SupabaseProvider, UsersService],
  controllers: [OrdersController],
})
export class OrdersModule {}