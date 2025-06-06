// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Sesuaikan path jika perlu
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../users/entities/user.entity'; // Sesuaikan path jika perlu

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Registers a new user.
   * @param registerUserDto - Data for user registration.
   * @returns The created user object (without password).
   * @throws ConflictException if email already exists.
   * @throws InternalServerErrorException if user creation fails for other reasons.
   */
  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'password'>> {
    const { email, password, firstName, lastName, phone, address } =
      registerUserDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Asumsi UsersService.create menerima objek yang sesuai dengan field User entity
      // Role dan isActive akan menggunakan nilai default dari entity/skema DB
      const newUser = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone, // Pass directly; if phone is undefined, it remains undefined
        address: address, // Pass directly; if address is undefined, it remains undefined
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = newUser; // Exclude password from the returned object [cite: 4]
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal membuat pengguna. Silakan coba lagi.',
      );
    }
  }

  /**
   * Logs in a user.
   * @param loginUserDto - Credentials for login.
   * @returns An object containing the access token and user details (without password).
   * @throws UnauthorizedException if credentials are invalid or account is inactive.
   */
  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const { email, password } = loginUserDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    // Pastikan user aktif jika ada field isActive [cite: 4, 30]
    if (user.hasOwnProperty('isActive') && !user.isActive) { 
        throw new UnauthorizedException('Akun Anda tidak aktif. Silakan hubungi administrator.');
    }

    const payload = {
      sub: user.id, 
      email: user.email,
      role: user.role, 
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      // Provide a default value if 'JWT_EXPIRES_IN' is not found or invalid
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h', // Default to 1 hour
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userResult } = user; // Exclude password [cite: 4]

    return {
      access_token: accessToken,
      user: userResult,
    };
  }

  /**
   * Validates a user by ID.
   * Typically used by JwtStrategy to fetch user details based on JWT payload.
   * @param userId - The ID of the user to validate.
   * @returns The user object if found, otherwise null.
   */
  async validateUserById(userId: number): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}