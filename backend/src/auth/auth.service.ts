// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../users/entities/user.entity';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  // Simple in-memory OTP store: Map<email, { otp, expiresAt }>
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async sendRegisterOtp(email: string): Promise<{ message: string }> {
    const emailLower = email.toLowerCase();
    
    // 1. Cek apakah user sudah terdaftar
    const existingUser = await this.usersService.findByEmail(emailLower);
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // 2. Generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Simpan OTP (Valid 5 menit)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    this.otpStore.set(emailLower, { otp, expiresAt });

    // 4. Kirim OTP via Email
    try {
      await this.mailService.sendOtp(emailLower, otp);
    } catch (error: any) {
       console.error("Failed to send email to " + emailLower, error);
       // We suppress the error here because MailService already handles error logging.
    }
    
    return { message: 'Kode OTP telah dikirim ke email Anda' };
  }

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'password'>> {
    const { email, password, firstName, lastName, phone, address, otp } = registerUserDto;

    // 1. PAKSA LOWERCASE SAAT REGISTER
    const emailLower = email.toLowerCase();

    // 2. Verifikasi OTP
    if (!otp) {
        throw new BadRequestException('Kode OTP diperlukan');
    }
    
    const storedOtp = this.otpStore.get(emailLower);
    
    if (!storedOtp) {
        throw new BadRequestException('Kode OTP tidak ditemukan atau sudah kadaluwarsa. Silakan minta ulang.');
    }
    
    if (storedOtp.otp !== otp) {
        throw new BadRequestException('Kode OTP salah.');
    }
    
    if (Date.now() > storedOtp.expiresAt) {
        this.otpStore.delete(emailLower);
        throw new BadRequestException('Kode OTP sudah kadaluwarsa.');
    }

    // Hapus OTP setelah verified agar tidak bisa dipakai ulang
    this.otpStore.delete(emailLower);

    const existingUser = await this.usersService.findByEmail(emailLower);
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const newUser = await this.usersService.create({
        email: emailLower,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
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