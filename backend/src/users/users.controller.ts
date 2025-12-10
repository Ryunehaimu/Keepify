// src/users/users.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RolesGuard } from '@src/common/guards/roles.guard';
import { Roles } from '@src/common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // GET: /admin/users
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
