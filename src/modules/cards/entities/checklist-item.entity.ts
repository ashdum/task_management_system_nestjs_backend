// src/modules/cards/entities/checklist-item.entity.ts
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Checklist } from './checklist.entity';

@Entity('checklist_items')
export class ChecklistItem extends BaseEntity {
  @ApiProperty({ description: 'Text of the checklist item', example: 'Step 1' })
  @Column()
  text!: string;

  @ApiProperty({ description: 'Completion status', example: false })
  @Column({ default: false })
  completed!: boolean;

  @ApiProperty({
    description: 'Checklist the item belongs to',
    type: () => Checklist,
  })
  @ManyToOne(() => Checklist, (checklist) => checklist.items)
  checklist!: Checklist;
}
