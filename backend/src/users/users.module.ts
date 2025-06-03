// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // Jika Anda memiliki controller
import { User } from './entities/user.entity';       // Impor entitas User

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // <-- Baris ini PENTING!
  ],
  controllers: [UsersController],    // Sertakan jika ada
  providers: [UsersService],
  exports: [UsersService],         // Ekspor UsersService agar bisa digunakan oleh modul lain (seperti AuthModule)
})
export class UsersModule {}