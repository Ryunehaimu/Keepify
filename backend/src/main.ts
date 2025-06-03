// src/main.ts (backend)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'; // <--- TAMBAHKAN IMPORT INI

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mendapatkan instance ConfigService dari aplikasi
  const configService = app.get(ConfigService); 

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const appPort = configService.get<number>('PORT') || 3001;

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(appPort);
  console.log(`Application is running on: ${await app.getUrl()}`); // Menampilkan URL aplikasi berjalan
}
bootstrap();