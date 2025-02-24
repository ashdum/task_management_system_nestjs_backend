// src/common/entities/base.entity.ts
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string; // UUID, автоматически генерируется TypeORM

  @ApiProperty({
    description: 'Date when the entity was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  // Managed by TypeORM, automatically set on creation
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'Date when the entity was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  // Managed by TypeORM, automatically updated on changes
  @UpdateDateColumn()
  updatedAt!: Date;
}
