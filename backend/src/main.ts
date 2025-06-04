// src/main.ts (backend)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express'; // <--- TAMBAHKAN IMPORT INI
import { join } from 'path'; // <--- TAMBAHKAN IMPORT INI

async function bootstrap() {
  // Ubah tipe 'app' menjadi NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService); 

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const appPort = configService.get<number>('PORT') || 3001;

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // --- TAMBAHKAN KONFIGURASI STATIC ASSETS DI SINI ---
  // Menyajikan file dari folder 'uploads' yang ada di root proyek Anda
  // (sejajar dengan folder 'src' dan 'dist')
  // Jika file ada di './uploads/item-images/namafile.jpg',
  // akan bisa diakses melalui URL: http://localhost:<appPort>/uploads/item-images/namafile.jpg
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Ini adalah prefix URL untuk mengakses aset statis
  });
  // ----------------------------------------------------

  await app.listen(appPort);
  console.log(`Application is running on: http://localhost:${appPort}`); // URL lebih eksplisit
  console.log(`Frontend URL (for CORS): ${frontendUrl}`);
}
bootstrap();