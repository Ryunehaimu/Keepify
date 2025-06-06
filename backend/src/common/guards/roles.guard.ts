// src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity'; // Pastikan path ke enum UserRole Anda benar
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Dapatkan peran yang dibutuhkan dari metadata decorator @Roles
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Cek metadata di level metode
      context.getClass(),   // Cek metadata di level controller
    ]);

    // Jika tidak ada decorator @Roles, izinkan akses (biarkan guard lain seperti JwtAuthGuard yang bekerja)
    if (!requiredRoles) {
      return true;
    }

    // 2. Dapatkan objek user dari request (yang sudah ditambahkan oleh JwtAuthGuard sebelumnya)
    const { user } = context.switchToHttp().getRequest();

    // 3. Bandingkan peran user dengan peran yang dibutuhkan
    // Cek apakah user ada dan apakah rolenya termasuk dalam daftar peran yang diizinkan
    if (!user || !user.role) {
      return false; // Jika tidak ada user atau role, tolak akses
    }
    
    return requiredRoles.some((role) => user.role === role);
  }
}