import { Column, Entity, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';

@Entity('attachments')
export class Attachment extends BaseEntity {
  @ApiProperty({
    description: 'Name of the attachment',
    example: 'document.pdf',
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: 'URL of the attachment',
    example: 'https://example.com/doc.pdf',
  })
  @Column()
  url!: string;

  @ApiProperty({
    description: 'Type of the attachment',
    example: 'application/pdf',
  })
  @Column()
  type!: string;

  @ApiProperty({
    description: 'Size of the attachment in bytes',
    example: 1024,
  })
  @Column({ type: 'integer' })
  size!: number;

  @ApiProperty({
    description: 'Card the attachment belongs to',
    type: () => Card,
  })
  @ManyToOne(() => Card, (card) => card.attachments)
  @Index('idx_attachments_cardId') // Индекс сохраняем
  card!: Card;
}
