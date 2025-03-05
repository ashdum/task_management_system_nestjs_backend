// src/modules/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import {
  IsStrongPassword,
  IsValidFullName,
} from 'common/decorators/validation';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    description:
      'User password (minimum 8 characters, with uppercase letter, lowercase letter, number, and special character)',
    example: 'Password123!',
  })
  @IsStrongPassword()
  password!: string;

  @ApiProperty({
    description:
      'User full name (2-50 characters, only letters, spaces, hyphens, and apostrophes)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsValidFullName()
  fullName?: string;

  @ApiProperty({
    description: 'URL of the user avatar',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  avatar?: string;
}