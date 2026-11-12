//api/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Allows the Next.js frontend to communicate with the backend.
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  //  Validates incoming request data using DTO validation rules.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //  Starts the backend server on port 3001 by default.
  await app.listen(process.env.PORT ?? 3001);
}

await bootstrap();
