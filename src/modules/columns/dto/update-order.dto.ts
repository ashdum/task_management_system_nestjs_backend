// src/modules/columns/dto/update-order.dto.ts
import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'ID of the dashboard',
    example: '7b672108-a35a-4b5f-b91f-e6fc22cef06f',
  })
  @IsNotEmpty({ message: 'dashboardId must not be empty' })
  @IsString({ message: 'dashboardId must be a string' })
  dashboardId!: string;

  @ApiProperty({
    description: 'Array of column IDs in the desired order',
    example: [
      '5a71016d-651b-4d78-9812-9650e13281d9',
      '9f748ac6-421e-4cd1-bb34-5dade1aaa591',
    ],
  })
  @Type(() => String)
  @IsArray({ message: 'columnIds must be an array' })
  @ArrayNotEmpty({ message: 'columnIds must not be empty' })
  @IsString({ each: true, message: 'Each column ID must be a string' })
  columnIds!: string[];
}