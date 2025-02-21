// src/modules/users/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/common/decorators/validation';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'ID пользователя, чей пароль нужно изменить',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'ID пользователя обязателен' })
  @IsString({ message: 'ID пользователя должен быть строкой' })
  userId!: string;

  @ApiProperty({
    description: 'Текущий (старый) пароль пользователя',
    example: 'current_password123',
  })
  @IsNotEmpty({ message: 'Старый пароль обязателен' })
  @IsString({ message: 'Старый пароль должен быть строкой' })
  oldPassword!: string;

  @ApiProperty({
    description: 'Новый пароль пользователя (минимум 8 символов, с заглавной буквой, строчной буквой, цифрой и спецсимволом)',
    example: 'NewPassword123!',
  })
  @IsNotEmpty({ message: 'Новый пароль обязателен' })
  @IsStrongPassword()
  newPassword!: string;
}