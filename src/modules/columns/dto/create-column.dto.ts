// src/modules/columns/dto/create-column.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ description: 'Title of the column', example: 'To Do' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'ID of the dashboard', example: 'dashboard-id' })
  @IsNotEmpty()
  @IsString()
  dashboardId!: string;
}