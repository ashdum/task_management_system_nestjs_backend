// src/modules/cards/dto/update-card.dto.ts
import {
    IsArray,
    IsOptional,
    IsString,
    IsNumber,
    IsDateString,
    ValidateNested,
    IsBoolean,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  import { Type } from 'class-transformer';
  
  export class LabelDto {
    @ApiProperty({
      description: 'ID of the label (optional, for updates)',
      example: 'label1',
      required: false,
    })
    @IsOptional()
    @IsString()
    id?: string;
  
    @ApiProperty({
      description: 'Text of the label',
      example: 'Urgent',
      required: false,
    })
    @IsOptional()
    @IsString()
    text?: string;
  
    @ApiProperty({
      description: 'Color of the label',
      example: '#FF0000',
      required: false,
    })
    @IsOptional()
    @IsString()
    color?: string;
  }
  
  export class ChecklistItemDto {
    @ApiProperty({
      description: 'ID of the checklist item (optional, for updates)',
      example: 'item-1741013285558',
      required: false,
    })
    @IsOptional()
    @IsString()
    id?: string;
  
    @ApiProperty({
      description: 'Text of the checklist item',
      example: 'dfgfd',
      required: false,
    })
    @IsOptional()
    @IsString()
    text?: string;
  
    @ApiProperty({
      description: 'Completion status of the checklist item',
      example: false,
      required: false,
    })
    @IsOptional()
    @IsBoolean()
    completed?: boolean;
  }
  
  export class ChecklistDto {
    @ApiProperty({
      description: 'ID of the checklist (optional, for updates)',
      example: 'checklist-1741013284142',
      required: false,
    })
    @IsOptional()
    @IsString()
    id?: string;
  
    @ApiProperty({
      description: 'Title of the checklist',
      example: 'dfgdf',
      required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;
  
    @ApiProperty({
      description: 'Items in the checklist',
      type: [ChecklistItemDto],
      required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChecklistItemDto)
    items?: ChecklistItemDto[];
  }
  
  export class CommentDto {
    @ApiProperty({
      description: 'ID of the comment (optional, for updates)',
      example: 'comment-1741013268614',
      required: false,
    })
    @IsOptional()
    @IsString()
    id?: string;
  
    @ApiProperty({
      description: 'Text of the comment',
      example: 'dfgfdgfd',
      required: false,
    })
    @IsOptional()
    @IsString()
    text?: string;
  
    @ApiProperty({
      description: 'ID of the user who made the comment',
      example: 'c09258b1-ebb6-4582-8e61-29f72fedc432',
      required: false,
    })
    @IsOptional()
    @IsString()
    userId?: string;
  
    @ApiProperty({
      description: 'Email of the user who made the comment (ignored during update)',
      example: 'terrasmartcity@gmail.com',
      required: false,
    })
    @IsOptional()
    @IsString()
    userEmail?: string;
  
    @ApiProperty({
      description: 'Creation timestamp of the comment (ignored during update)',
      example: '2025-03-03T14:47:48.614Z',
      required: false,
    })
    @IsOptional()
    @IsDateString()
    createdAt?: string;
  }
  
  export class AttachmentDto {
    @ApiProperty({
      description: 'ID of the attachment (optional, for updates)',
      example: 'attachment-123',
      required: false,
    })
    @IsOptional()
    @IsString()
    id?: string;
  
    @ApiProperty({
      description: 'Name of the attachment',
      example: 'document.pdf',
      required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;
  
    @ApiProperty({
      description: 'URL of the attachment',
      example: 'https://example.com/doc.pdf',
      required: false,
    })
    @IsOptional()
    @IsString()
    url?: string;
  
    @ApiProperty({
      description: 'Type of the attachment',
      example: 'application/pdf',
      required: false,
    })
    @IsOptional()
    @IsString()
    type?: string;
  
    @ApiProperty({
      description: 'Size of the attachment in bytes',
      example: 1024,
      required: false,
    })
    @IsOptional()
    @IsNumber()
    size?: number;
  }
  
  export class UpdateCardDto {
    @ApiProperty({
      description: 'ID of the card (ignored during update)',
      example: 'e0928a72-7a5f-4b37-933f-3bc61d0c675e',
      required: false,
    })
    @IsOptional()
    @IsString()
    id?: string;
  
    @ApiProperty({
      description: 'Creation timestamp (ignored during update)',
      example: '2025-03-03T07:23:02.032Z',
      required: false,
    })
    @IsOptional()
    @IsDateString()
    createdAt?: string;
  
    @ApiProperty({
      description: 'Update timestamp (ignored during update)',
      example: '2025-03-03T12:34:18.372Z',
      required: false,
    })
    @IsOptional()
    @IsDateString()
    updatedAt?: string;
  
    @ApiProperty({
      description: 'Card number (ignored during update)',
      example: 1,
      required: false,
    })
    @IsOptional()
    @IsNumber()
    number?: number;
  
    @ApiProperty({
      description: 'Title of the card',
      example: 'Task 1',
      required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;
  
    @ApiProperty({
      description: 'Description of the card',
      example: 'Do this task',
      required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
  
    @ApiProperty({
      description: 'ID of the column',
      example: 'column-id',
      required: false,
    })
    @IsOptional()
    @IsString()
    columnId?: string;
  
    @ApiProperty({
      description: 'Labels for the card',
      type: [LabelDto],
      required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LabelDto)
    labels?: LabelDto[];
  
    @ApiProperty({
      description: 'Due date of the card',
      example: '2025-03-01',
      required: false,
    })
    @IsOptional()
    @IsString()
    dueDate?: string;
  
    @ApiProperty({
      description: 'Image URLs',
      example: ['https://example.com/img1.jpg'],
      required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
  
    @ApiProperty({
      description: 'Dashboard ID (ignored during update)',
      example: 'dashboard-id',
      required: false,
    })
    @IsOptional()
    @IsString()
    dashboardId?: string;
  
    @ApiProperty({
      description: 'Members assigned to the card (ignored during update)',
      example: [],
      required: false,
    })
    @IsOptional()
    @IsArray()
    members?: any[];
  
    @ApiProperty({
      description: 'Checklists on the card',
      type: [ChecklistDto],
      required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChecklistDto)
    checklists?: ChecklistDto[];
  
    @ApiProperty({
      description: 'Comments on the card',
      type: [CommentDto],
      required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CommentDto)
    comments?: CommentDto[];
  
    @ApiProperty({
      description: 'Attachments on the card',
      type: [AttachmentDto],
      required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttachmentDto)
    attachments?: AttachmentDto[];
  }