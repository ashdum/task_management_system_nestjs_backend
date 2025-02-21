// src/modules/columns/dto/create-column.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ description: 'Title of the column', example: 'To Do' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Order of the column', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  order!: number;

  @ApiProperty({ description: 'ID of the dashboard', example: 'dashboard-id' })
  @IsNotEmpty()
  @IsString()
  dashboardId!: string;

  @ApiProperty({ description: 'Is the column archived?', example: false, required: false })
  @IsOptional()
  is_archive?: boolean;
}