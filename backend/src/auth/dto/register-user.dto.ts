import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8) // Contoh: password minimal 8 karakter
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak. Password should contain at least one uppercase letter, one lowercase letter, and one number or special character.'
  })
  password: string;

  @IsOptional()
@IsPhoneNumber('ID', { message: 'Format nomor telepon tidak valid untuk Indonesia.' })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}