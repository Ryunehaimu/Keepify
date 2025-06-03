// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'; // Pastikan StrategyOptions diimpor
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity'; // Sesuaikan path jika perlu

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      // Baris inilah yang paling penting untuk error Anda:
      // Pastikan passReqToCallback TIDAK di-set ke true.
      // Anda bisa menghapus baris passReqToCallback sepenuhnya (karena false seringkali default),
      // atau secara eksplisit mengaturnya ke false.
      passReqToCallback: false, 
    }); 
    // Anda tidak perlu 'as StrategyOptions' jika TypeScript bisa menyimpulkannya,
    // tetapi jika Anda melakukannya, gunakan 'as StrategyOptions'.
  }

  async validate(payload: { sub: number; email: string; role: string }): Promise<Omit<User, 'password'>> {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token tidak valid atau pengguna tidak ditemukan.');
    }
    if (!user.isActive) {
        throw new UnauthorizedException('Akun pengguna tidak aktif.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}