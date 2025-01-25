// E-Learning-Backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { ServeStaticModule } from '@nestjs/serve-static';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
