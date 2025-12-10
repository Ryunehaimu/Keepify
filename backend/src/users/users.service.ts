// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity'; // Menggunakan path relatif yang lebih umum
// Buat DTO untuk create user jika diperlukan, atau gunakan Partial<User>
// import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService { // Perubahan: Nama kelas harus UsersService, bukan AuthService
  constructor(
    @InjectRepository(User) // Inject User repository
    private usersRepository: Repository<User>,
  ) { }

  /**
   * Membuat user baru.
   * @param userData - Data untuk user baru. Termasuk password yang sudah di-hash.
   * @returns User yang baru dibuat.
   */
  async create(userData: Partial<User>): Promise<User> {
    // userData sudah termasuk password yang di-hash dari AuthService
    // role dan isActive bisa di-set di sini atau mengandalkan default dari entity/DB
    const newUser = this.usersRepository.create({
      ...userData,
      // Jika entity User Anda sudah memiliki nilai default untuk role dan isActive,
      // baris di bawah ini mungkin tidak diperlukan atau bisa disesuaikan.
      // Panduan Anda menunjukkan default ada di entity. [cite: 29, 30]
      role: userData.role || UserRole.USER, // Default role [cite: 29]
      isActive: userData.isActive === undefined ? true : userData.isActive, // Default isActive [cite: 30]
    });
    return this.usersRepository.save(newUser);
  }

  /**
   * Mencari user berdasarkan email.
   * @param email - Email user.
   * @returns User object jika ditemukan, null jika tidak.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Mencari user berdasarkan ID.
   * @param id - ID user.
   * @returns User object jika ditemukan, null jika tidak.
   */
  async findById(id: number): Promise<User | null> {
    if (!id) {
      return null;
    }
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<any[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt'],
    });

    // mapping agar ada 'name' property
    return users.map(u => ({
      ...u,
      name: `${u.firstName} ${u.lastName || ''}`,
    }));
  }
}