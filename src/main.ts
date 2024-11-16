import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin:[
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://192.168.1.4:8080'

    ],
    credentials:true
  });
  // app.useStaticAssets(join('public'));
  app.use(express.static(join(__dirname ,'..','public')));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  await app.listen(3000);
}
bootstrap();
