import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,

    // 2. Autorise explicitement toutes les méthodes HTTP y compris OPTIONS
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // 3. Autorise tous les en-têtes de requêtes (JWT, Ngrok, Content-Type...)
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'ngrok-skip-browser-warning',
    ],

    // 4. Permet l'envoi de cookies/tokens d'authentification
    credentials: true,

    // 5. Répond 200/204 aux requêtes OPTIONS avec les bons en-têtes
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Sert le dossier uploads/ à l'URL /uploads/... (ex. photos de profil)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
