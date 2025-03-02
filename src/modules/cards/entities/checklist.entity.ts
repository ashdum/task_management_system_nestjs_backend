import { Column, Entity, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';
import { ChecklistItem } from './checklist-item.entity';

@Entity('checklists')
export class Checklist extends BaseEntity {
  @ApiProperty({
    description: 'Title of the checklist',
    example: 'Steps to complete',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Items in the checklist',
    type: () => [ChecklistItem],
  })
  @OneToMany(() => ChecklistItem, (item) => item.checklist, { cascade: true })
  items!: ChecklistItem[];

  @ApiProperty({
    description: 'Card the checklist belongs to',
    type: () => Card,
  })
  @ManyToOne(() => Card, (card) => card.checklists)
  @Index('idx_checklists_cardId') // Индекс сохраняем
  card!: Card;
}
