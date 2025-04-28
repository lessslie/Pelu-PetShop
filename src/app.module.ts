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
import { ServiciosController } from './servicios/servicios.controller';
import { ServiciosModule } from './servicios/servicios.module';

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
    ServiciosModule,
    PaymentModule,

  ],
  controllers: [AppController, ServiciosController],
  providers: [AppService],
})
export class AppModule {}
