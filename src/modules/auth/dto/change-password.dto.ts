// src/modules/auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'common/decorators/validation';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'ID of the user whose password needs to be changed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  userId!: string;

  @ApiProperty({
    description: 'Current (old) user password',
    example: 'current_password123',
  })
  @IsNotEmpty({ message: 'Old password is required' })
  @IsString({ message: 'Old password must be a string' })
  oldPassword!: string;

  @ApiProperty({
    description:
      'New user password (minimum 8 characters, with uppercase letter, lowercase letter, number, and special character)',
    example: 'NewPassword123!',
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsStrongPassword()
  newPassword!: string;
}