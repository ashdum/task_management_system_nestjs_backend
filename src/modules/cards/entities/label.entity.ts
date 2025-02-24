// src/modules/cards/entities/label.entity.ts
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';

@Entity('labels')
export class Label extends BaseEntity {
  @ApiProperty({ description: 'Text of the label', example: 'Urgent' })
  @Column()
  text!: string;

  @ApiProperty({ description: 'Color of the label', example: '#FF0000' })
  @Column()
  color!: string;

  @ApiProperty({ description: 'Card the label belongs to', type: () => Card })
  @ManyToOne(() => Card, (card) => card.labels)
  card!: Card;
}
