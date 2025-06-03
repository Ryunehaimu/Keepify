import { IsNotEmpty, IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEntrustedItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  estimatedValue?: string; // Keep as string to match frontend

  @IsOptional()
  @IsString()
  itemCondition?: string; // Changed from 'condition' to 'itemCondition'

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}