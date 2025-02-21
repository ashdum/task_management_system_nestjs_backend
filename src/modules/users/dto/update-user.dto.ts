// src/modules/users/dto/update-user.dto.ts
import { IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'URL to user avatar',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'newpassword123',
    required: false,
  })
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;
}