// src/admin/admin.controller.ts

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@src/common/guards/roles.guard';
import { Roles } from '@src/common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ItemsService } from '../items/items.service'; // <-- Gunakan service dari ItemsModule
import { OrderStatus } from '../items/entities/entrustment-order.entity';
import { CompletePickupDto } from '../items/dto/complete-pickup.dto';

@Controller('admin') // <-- Prefix untuk semua rute di sini adalah /admin
@UseGuards(JwtAuthGuard, RolesGuard) // Lindungi semua rute di controller ini
@Roles(UserRole.ADMIN) // Hanya admin yang bisa mengakses semua rute di controller ini
export class AdminController {
  constructor(
    // Inject ItemsService dari ItemsModule
    private readonly itemsService: ItemsService,
  ) {}

  /**
   * [ADMIN] Mendapatkan daftar order berdasarkan status
   * @URL GET /api/admin/orders?status=PENDING_PICKUP
   */
  @Get('orders')
  getOrdersByStatus(@Query('status') status: OrderStatus) {
    if (!status) {
      throw new BadRequestException('Query parameter "status" is required.');
    }
    // Panggil metode dari ItemsService yang sudah kita buat sebelumnya
    return this.itemsService.findOrdersByStatusForAdmin(status);
  }

  /**
   * [ADMIN] Menyelesaikan proses pickup untuk sebuah order
   * @URL POST /api/admin/orders/123/complete-pickup
   */
  @Post('orders/:id/complete-pickup')
  completePickup(
    @Param('id', ParseIntPipe) id: number,
    @Body() completePickupDto: CompletePickupDto,
  ) {
    // Panggil metode dari ItemsService yang sudah kita buat sebelumnya
    return this.itemsService.completePickupProcess(id, completePickupDto);
  }

  @Get('dashboard/summary')
  getDashboardSummary() {
    return this.itemsService.getAdminDashboardSummary();
  }

  // Anda bisa menambahkan endpoint admin lainnya di sini di masa depan
  // Misalnya: GET /admin/dashboard-summary, GET /admin/users, dll.
}