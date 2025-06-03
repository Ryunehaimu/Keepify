import { Module } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // 1. Impor UsersModule
import { PassportModule } from '@nestjs/passport';   // 2. Impor PassportModule
import { JwtModule } from '@nestjs/jwt';             // 3. Impor JwtModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // 5. Untuk konfigurasi JWT
import { JwtStrategy } from './jwt.strategy';       // 4. Impor JwtStrategy Anda

@Module({
  imports: [
    UsersModule, // Untuk mengakses UsersService
    PassportModule.register({ defaultStrategy: 'jwt' }), // Mengatur strategi default Passport
    JwtModule.registerAsync({
      imports: [ConfigModule], // Memastikan ConfigModule tersedia untuk JwtModule
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Mengambil secret dari .env [cite: 14]
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'), // Mengambil waktu kedaluwarsa dari .env [cite: 14]
        },
      }),
      inject: [ConfigService], // Menyuntikkan ConfigService ke useFactory
    }),
    // ConfigModule tidak perlu diimpor di sini jika sudah global di AppModule [cite: 17, 22]
  ],
  providers: [
    AuthService,
    JwtStrategy, // 4. Daftarkan JwtStrategy sebagai provider
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule], // Opsional: Ekspor jika dibutuhkan oleh modul lain
})
export class AuthModule {}