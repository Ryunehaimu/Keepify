// src/admin/admin.module.ts

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ItemsModule } from '../items/items.module'; // <-- IMPORT ItemsModule

@Module({
  imports: [
    ItemsModule, // <-- TAMBAHKAN di sini agar service dari ItemsModule bisa di-inject
  ],
  controllers: [AdminController],
  providers: [], // Tidak perlu service baru jika logikanya sudah ada di ItemsService
})
export class AdminModule {}