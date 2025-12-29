// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'password'>> {
    const { email, password, firstName, lastName, phone, address } = registerUserDto;

    // 1. PAKSA LOWERCASE SAAT REGISTER (PENTING DI LINUX)
    const emailLower = email.toLowerCase(); // <--- PERUBAHAN 1

    const existingUser = await this.usersService.findByEmail(emailLower); // Gunakan emailLower
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const newUser = await this.usersService.create({
        email: emailLower, // <--- PERUBAHAN 2: Simpan versi lowercase ke DB
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone,
        address: address,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = newUser;
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal membuat pengguna. Silakan coba lagi.',
      );
    }
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const { email, password } = loginUserDto;
    
    // 2. PAKSA LOWERCASE SAAT LOGIN (PENTING DI LINUX)
    // Jika user mengetik 'Admin@Gmail.com', kita ubah jadi 'admin@gmail.com' agar cocok dengan DB
    const emailLower = email.toLowerCase(); // <--- PERUBAHAN 3

    console.log(`Debug Login: Mencari email '${emailLower}'`); // Tambahkan log ini

    const user = await this.usersService.findByEmail(emailLower); // Gunakan emailLower

    if (!user) {
      console.log('Debug Login: User tidak ditemukan di DB'); // Log error
      throw new UnauthorizedException('Email atau password salah.');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      console.log('Debug Login: Password hash tidak cocok'); // Log error
      throw new UnauthorizedException('Email atau password salah.');
    }

    if (user.hasOwnProperty('isActive') && !user.isActive) {
      throw new UnauthorizedException('Akun Anda tidak aktif.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userResult } = user;

    return {
      access_token: accessToken,
      user: userResult,
    };
  }

  async validateUserById(userId: number): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}