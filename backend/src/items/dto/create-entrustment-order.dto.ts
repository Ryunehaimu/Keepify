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
  IsEnum 
} from 'class-validator';
import { CreateEntrustedItemDto } from './create-entrusted-item.dto';

export enum MonitoringFrequencyDto {
  NONE = 'none',
  WEEKLY_ONCE = 'weekly_once',
  WEEKLY_TWICE = 'weekly_twice',
}

export class CreateEntrustmentOrderDto {
  @IsBoolean()
  allowChecks: boolean;

  @IsEnum(MonitoringFrequencyDto)
  monitoringFrequency: string;

  @IsNotEmpty()
  @IsDateString()
  pickupRequestedDate: string;

  @IsNotEmpty()
  @IsString()
  pickupAddress: string;

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