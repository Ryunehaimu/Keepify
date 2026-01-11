// src/items/dto/create-entrustment-order.dto.ts
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  ValidateNested, 
  IsDateString,
  IsEnum,
  IsNumber
} from 'class-validator';
import { CreateEntrustedItemDto } from './create-entrusted-item.dto';

export enum MonitoringFrequencyDto {
  NONE = 'none',
  WEEKLY_ONCE = 'weekly_once',
  WEEKLY_TWICE = 'weekly_twice',
}

export class CreateEntrustmentOrderDto {
  @IsBoolean()
  @IsOptional()
  isPickupRequired?: boolean;

  @IsBoolean()
  allowChecks: boolean;

  @IsEnum(MonitoringFrequencyDto)
  monitoringFrequency: string;

  @IsOptional()
  @IsDateString()
  pickupRequestedDate?: string;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsNumber()
  pickupDistance?: number;  // Distance in KM

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsDateString()
  expectedRetrievalDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntrustedItemDto)
  entrustedItems: CreateEntrustedItemDto[];
}