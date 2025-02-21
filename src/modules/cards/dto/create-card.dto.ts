// src/modules/cards/dto/create-card.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({ description: 'Card number', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  number!: number;

  @ApiProperty({ description: 'Title of the card', example: 'Task 1' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Description of the card', example: 'Do this task', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID of the column', example: 'column-id' })
  @IsNotEmpty()
  @IsString()
  columnId!: string;

  @ApiProperty({ description: 'IDs of members assigned to the card', example: ['user1-id'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];

  @ApiProperty({
    description: 'Labels for the card',
    example: [{ text: 'Urgent', color: '#FF0000' }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  labels?: { text: string; color: string }[];

  @ApiProperty({ description: 'Due date of the card', example: '2025-03-01', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ description: 'Image URLs', example: ['https://example.com/img1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}