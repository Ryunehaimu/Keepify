// src/items/dto/complete-pickup.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class CompletePickupDto {
  @IsString()
  @IsNotEmpty()
  signatureImage: string; // Akan berisi data gambar base64 dari frontend
}