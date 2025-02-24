// src/modules/dashboards/dto/create-dashboard.dto.ts
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Интерфейс настроек дашборда
export interface DashboardSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowInvites: boolean;
  theme?: string;
}

export class CreateDashboardDto {
  @ApiProperty({
    description: 'Title of the dashboard',
    example: 'My Project Dashboard',
  })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'List of owner IDs (UUIDs)',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  ownerIds!: string[];

  @ApiProperty({
    description: 'Background color or image URL',
    example: '#FFFFFF',
    required: false,
  })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiProperty({
    description: 'Description of the dashboard',
    example: 'Dashboard for project management',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Is the dashboard public?',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Dashboard settings',
    example: {
      isPublic: false,
      allowComments: true,
      allowInvites: true,
      theme: 'light',
    },
    required: false,
  })
  @IsOptional()
  settings?: DashboardSettings;
}
