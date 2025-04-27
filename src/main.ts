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
  const allowedOrigins = [
    'https://petshop-frontend-eight.vercel.app',
    'http://localhost:3000',
    // Permite cualquier preview de Vercel para tu proyecto
    /^https:\/\/petshop-frontend-[^.]+\.vercel\.app$/,
    // Permite cualquier subdominio generado por Vercel para tu proyecto
    /^https:\/\/petshop-frontend-[^.]+-agatas-projects-[^.]+\.vercel\.app$/
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requests sin origin (como Postman)
      if (!origin) return callback(null, true);
  
      // Permite si el origin está en la lista o matchea el regex
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.some(o => o instanceof RegExp && o.test(origin))
      ) {
        return callback(null, true);
      }
      // Si no, rechaza
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Access-Control-Allow-Origin',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
  console.log(`La aplicación está corriendo en: ${process.env.NEXT_PUBLIC_API_URL}/api`);
}
bootstrap();