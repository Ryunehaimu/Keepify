// src/items/dto/create-item.dto.ts
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsNumberString,
} from 'class-validator';
import { OrderStatus } from '../entities/entrustment-order.entity'; // Fixed: Use OrderStatus instead of ItemStatus

// Export OrderStatus as ItemStatus for backward compatibility
export { OrderStatus as ItemStatus } from '../entities/entrustment-order.entity';

export class CreateItemDto {
  @IsString({ message: 'Nama barang harus berupa teks' })
  @IsNotEmpty({ message: 'Nama barang tidak boleh kosong' })
  @MinLength(3, { message: 'Nama barang minimal 3 karakter' })
  @MaxLength(150, { message: 'Nama barang maksimal 150 karakter' })
  name: string;

  @IsString({ message: 'Deskripsi harus berupa teks' })
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  @MinLength(10, { message: 'Deskripsi minimal 10 karakter' })
  description: string;

  @IsString({ message: 'Kategori harus berupa teks' })
  @IsNotEmpty({ message: 'Kategori tidak boleh kosong' })
  @MaxLength(100, { message: 'Kategori maksimal 100 karakter' })
  category: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Estimasi nilai harus berupa angka dalam format string' })
  estimatedValue?: string;

  @IsOptional()
  @IsString({ message: 'Kondisi barang harus berupa teks' })
  @MinLength(3, { message: 'Kondisi barang minimal 3 karakter' })
  @MaxLength(255, { message: 'Kondisi barang maksimal 255 karakter' })
  condition?: string;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Status tidak valid' })
  status?: OrderStatus;
}