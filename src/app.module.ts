import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Auth/auth.module';
import { UsersModule } from './Users/users.module';
import { ProductsModule } from './Products/products.module';
import { OrdersModule } from './Orders/orders.module';
import { TurnosModule } from './turnos/turnos.module';
import { MailModule } from './Mails/mail.module';
import { PaymentModule } from './Pagos/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    TurnosModule,
    MailModule,
    PaymentModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
