import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
    // Aplicar filtro global de excepciones
    app.useGlobalFilters(new AllExceptionsFilter());

  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe());
  
  // Habilitar CORS
  app.enableCors({
    origin: '*',  // Temporalmente permite todas las conexiones
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Access-Control-Allow-Origin',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('PetShop API')
    .setDescription('API para tienda de mascotas y servicios de peluquería canina')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y registro')
    .addTag('users', 'Gestión de usuarios')
    .addTag('products', 'Gestión de productos')
    .addTag('orders', 'Gestión de pedidos')
    .addTag('turnos', 'citas de peluquería canina')
    .addTag('payment', 'Pagos con Mercado Pago')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Usamos la variable de entorno PORT, o 3001 como fallback
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`La aplicación está corriendo en: ${await app.getUrl()}`);
  console.log('La aplicación está corriendo en: http://localhost:3001/api');
}
bootstrap();