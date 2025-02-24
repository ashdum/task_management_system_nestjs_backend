// src/modules/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import {
  IsStrongPassword,
  IsValidFullName,
} from 'src/common/decorators/validation';

export class RegisterDto {
  @ApiProperty({
    description: 'Адрес электронной почты пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Неверный формат email' })
  email!: string;

  @ApiProperty({
    description:
      'Пароль пользователя (минимум 8 символов, с заглавной буквой, строчной буквой, цифрой и спецсимволом)',
    example: 'Password123!',
  })
  @IsStrongPassword()
  password!: string;

  @ApiProperty({
    description:
      'Полное имя пользователя (2-50 символов, только буквы, пробелы, дефисы и апострофы)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsValidFullName()
  fullName?: string;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  avatar?: string;
}
