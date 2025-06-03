// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
// import { JwtAuthGuard } from './jwt-auth.guard'; // Jika Anda sudah membuatnya
// import { CurrentUser } from './decorators/current-user.decorator'; // Jika Anda membuat decorator kustom
// import { User } from '../users/entities/user.entity';

@Controller('auth') // Pastikan prefix ini ada dan benar
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Pastikan endpoint ini ada dan benar
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard) // This protects the route
  @Get('profile')
  async getProfile(@Req() req: any) { // req.user will be populated by JwtStrategy
    return req.user; // JwtStrategy's validate method should return the user object
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async getProfile(@CurrentUser() user: User) { // Menggunakan decorator CurrentUser jika ada
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { password, ...result } = user;
  //   return result;
  // }
}